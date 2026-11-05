const libs = {
  admin: require("/lib/xp/admin"),
  content: require("/lib/xp/content"),
  context: require("/lib/xp/context"),
  freemarker: require("/lib/tineikt/freemarker"),
  portal: require("/lib/xp/portal"),
  repository: require("/lib/repository"),
  util: require("/lib/util"),
  enums: require("/lib/enums")
};

exports.get = (req) => {
  const contentId = req?.params?.contentId;
  const repository = req?.params?.repository;
  const branch = req?.params?.branch;

  let title = "";
  let count = 0;
  let questions = [];
  let message = "widget.selectInquiry";

  if (typeof contentId === "string" && typeof repository === "string" && typeof branch === "string") {
    const content = libs.context.run({ repository: repository, branch: branch }, () => libs.content.get({ key: contentId }));

    if (content?.type === `${app.name}:inquiry`) {
      title = content.displayName;
      message = "widget.noReplies";
      const inquiry = libs.repository.getInquiry(`${libs.enums.NODE.PATH}/${content._id}`);

      if (inquiry) {
        const replies = libs.util.forceArray(libs.repository.getAnswers(content._id));
        count = replies.length;
        questions = libs.util.forceArray(inquiry.questions).map((question) => {
          const config = question[question._selected];
          const answers = [];
          let answerCount = 0;

          replies.forEach((reply) => {
            const replyAnswers = libs.util.forceArray(reply.answers[config.id]);

            if (replyAnswers.filter((text) => text !== null && typeof text !== "undefined" && text !== "").length > 0) {
              answerCount += 1;
            }

            replyAnswers.forEach((text) => {
              const answer = answers.filter((item) => item.text === text)[0];
              if (answer) {
                answer.count += 1;
              } else {
                answers.push({ text: text, count: 1 });
              }
            });
          });

          answers.sort((first, second) => second.count - first.count);
          return {
            title: config.question,
            answerCount: answerCount,
            answers: answers.map((answer) => ({
              text: libs.util.decodeHtml(answer.text, "script"),
              count: answer.count
            }))
          };
        });
      }
    }
  }

  const model = {
    locale: libs.admin.getLocale() ?? "en",
    urlCss: libs.portal.assetUrl({ path: "css/widget.css" }),
    title: title,
    count: count,
    questions: questions,
    message: message
  };

  const body = libs.freemarker.render(resolve("./inquiry-results.ftl"), model);

  return {
    contentType: "text/html",
    body
  };
};
