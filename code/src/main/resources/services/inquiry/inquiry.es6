const libs = {
  portal: require("/lib/xp/portal"),
  content: require("/lib/xp/content"),
  repository: require("/lib/repository"),
  util: require("/lib/util")
};

exports.post = (req) => {
  const answers = req.params;
  const identifier = answers.inquiryIdentifier;
  const inquiry = typeof identifier === "string" ? libs.content.get({ key: identifier }) : null;
  const site = libs.portal.getSite();
  const inquirySite = inquiry ? libs.content.getSite({ key: inquiry._id }) : null;
  const questions = inquiry ? libs.util.forceArray(inquiry.data.popupQuestions) : [];
  const hasRequiredAnswers = questions.every((question) => {
    const questionType = question._selected;
    const questionConfig = question[questionType];
    if (!questionConfig || !questionConfig.required) {
      return true;
    }

    const answer = answers[questionConfig.id];
    const answerValues = Array.isArray(answer) ? answer : [answer];
    if (questionType === "checkboxAnswer" || questionType === "radiobuttonAnswer") {
      const answerOptions = libs.util.forceArray(questionConfig.answerOptions);
      return answerValues.length > 0 && answerValues.every((value) => answerOptions.some((option) => option.text === value));
    }

    return answerValues.some((value) => typeof value === "string" && value.trim().length > 0);
  });
  let savedAnswers = false;

  // Filter out bots by checking if honeypot input field is empty
  if (!answers.inquiryBait && inquiry?.type === `${app.name}:inquiry`
    && identifier === inquiry._id && inquiry.data.active && site && inquirySite?._id === site._id
    && hasRequiredAnswers) {
    delete answers.inquiryBait;
    delete answers.inquiryIdentifier;

    // Sanitize the form inputs
    Object.keys(answers).forEach((key) => {
      const value = answers[key];

      if (Array.isArray(value)) {
        value.forEach((arrayValue, index) => {
          if (arrayValue) {
            value[index] = libs.portal.sanitizeHtml(arrayValue).replace(/\r?\n|\r/g, "<br>").trim();
          }
        });
      } else if (value) {
        answers[key] = libs.portal.sanitizeHtml(value).replace(/\r?\n|\r/g, "<br>").trim();
      }
    });

    // Save/update the current inquiry questions and save the answers
    savedAnswers = libs.util.runAsAdmin(() => {
      if (libs.repository.checkRepo() && libs.repository.saveInquiry(identifier, questions) && libs.repository.saveAnswers(identifier, answers)) {
        return true;
      }

      return false;
    });
  }

  return {
    body: {
      saved: savedAnswers
    },
    contentType: "application/json"
  };
};
