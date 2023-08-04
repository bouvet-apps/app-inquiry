const libs = {
  freemarker: require("/lib/tineikt/freemarker"),
  portal: require("/lib/xp/portal"),
  admin: require("/lib/xp/admin"),
  repository: require("/lib/repository"),
  util: require("/lib/util")
};

exports.get = (req) => {
  // Generate test with randomized replies
  if (req.params.id && req.params.name && req.params.count && req.params.action === "generate-test") {
    const inquiry = libs.repository.getInquiry(req.params.id);

    if (inquiry) {
      libs.repository.generateTestInquiry(inquiry, req.params.name, req.params.count);
    }
  }

  // Export request
  if (req.params.id && req.params.action === "export-xls") {
    const body = {};
    const inquiry = libs.repository.getInquiry(req.params.id);

    if (inquiry) {
      const headers = ["Date", ...libs.util.forceArray(inquiry.questions).map((item) => item[item._selected].question)];
      const rows = libs.util.forceArray(libs.repository.getAnswers(inquiry._name)).map((x) => {
        const row = { date: x._ts, ...x.answers };

        // Check for answers with multiple selected checkboxes, these are saved as an array and need to be stringified
        Object.keys(row).forEach((key) => {
          if (Array.isArray(row[key])) {
            row[key] = row[key].toString();
          }

          row[key] = libs.util.decodeHtml(row[key], "excel");
        });

        return row;
      });

      // Return json objects for the xlsx script to use. The order of the headers/questions is determined by the latest reply (first in array).
      body.xlsHeaders = headers;
      body.xlsRows = rows;
      body.status = "OK";
    } else {
      body.status = "INQUIRY NOT FOUND";
    }

    return {
      contentType: "application/json",
      body: body
    };
  }

  // Delete request
  if (req.params.id && req.params.action === "delete") {
    const body = {};
    const inquiry = libs.repository.getInquiry(req.params.id);

    if (inquiry) {
      libs.repository.deleteInquiry(inquiry._name);
      body.status = "OK";
    } else {
      body.status = "INQUIRY NOT FOUND";
    }

    return {
      contentType: "application/json",
      body: body
    };
  }

  // Get results request
  const allInquiries = libs.util.forceArray(libs.repository.getInquiries());
  const inquiryList = [];
  const chartItems = [];

  // Get all the questions and answers for the supplied inquiry id, or for the latest inquiry if no id is supplied
  if (allInquiries.length > 0) {
    let displayedInquiry;
    let displayedInquiryId;
    let allQuestions = [];
    let allAnswers = [];
    let dateFirstReply = "";
    let dateLastReply = "";

    if (req.params.id) {
      displayedInquiry = allInquiries.filter((x) => x._id === req.params.id)[0];
    } else {
      displayedInquiry = allInquiries[0];
    }

    if (displayedInquiry) {
      displayedInquiryId = displayedInquiry._id;
      allQuestions = libs.util.forceArray(displayedInquiry.questions);
      const allAnswerNodes = libs.util.forceArray(libs.repository.getAnswers(displayedInquiry._name));

      if (allAnswerNodes.length > 0) {
        allAnswers = allAnswerNodes.map((x) => x.answers);
        dateFirstReply = allAnswerNodes[allAnswerNodes.length - 1]._ts ?? "";
        dateLastReply = allAnswerNodes[0]._ts ?? "";
      }
    }

    allInquiries.forEach((inquiry) => {
      inquiryList.push({
        name: inquiry._name,
        id: inquiry._id,
        count: libs.repository.getChildrenCount(inquiry._id),
        displayed: inquiry._id === displayedInquiryId,
        dateFirst: dateFirstReply ? new Date(dateFirstReply).toUTCString() : "",
        dateLast: dateLastReply ? new Date(dateLastReply).toUTCString() : ""
      });
    });

    // Format questions and answers into array of chartItems to use with Google charts
    allQuestions.forEach((question) => {
      const chartItem = {
        id: question[question._selected].id,
        type: "list",
        height: 400,
        title: question[question._selected].question,
        answers: []
      };

      if (question._selected === "textlineAnswer" || question._selected === "textareaAnswer") {
        const uniqueAnswersCount = new Set(allAnswers.filter((answer) => (answer[chartItem.id])).map((answer) => answer[chartItem.id])).size;

        if (uniqueAnswersCount > 20) {
          chartItem.answers = allAnswers.filter((answer) => (answer[chartItem.id])).map((answer) => ({ text: answer[chartItem.id], count: 1 }));
        } else {
          allAnswers.forEach((answer) => {
            const answerText = answer[chartItem.id];

            if (answerText) {
              const htmlDecodedText = libs.util.decodeHtml(answerText, "script");
              const chartItemAnswer = chartItem.answers.filter((x) => x.text === htmlDecodedText);

              if (chartItemAnswer.length > 0) {
                chartItemAnswer[0].count++;
              } else {
                chartItem.answers.push({ text: htmlDecodedText, count: 1 });
              }
            }
          });

          // Only show as barchart if at least one answer occurs more than once
          if (chartItem.answers.some((x) => x.count > 1)) {
            chartItem.type = "barchart";
            chartItem.height = (30 * uniqueAnswersCount) + 60;
          }
        }
      } else {
        allAnswers.forEach((answer) => {
          const answerArray = libs.util.forceArray(answer[chartItem.id]);

          answerArray.forEach((answerText) => {
            const htmlDecodedText = libs.util.decodeHtml(answerText, "script");
            const chartItemAnswer = chartItem.answers.filter((x) => x.text === htmlDecodedText);

            if (chartItemAnswer.length > 0) {
              chartItemAnswer[0].count++;
            } else {
              chartItem.answers.push({ text: htmlDecodedText, count: 1 });
            }
          });
        });

        chartItem.type = "piechart";
      }

      chartItems.push(chartItem);
    });

    // Sort some chart types by count
    chartItems.forEach((chartItem) => {
      if (chartItem.type === "barchart" || chartItem.type === "piechart") {
        chartItem.answers.sort((a1, a2) => (a1.count < a2.count ? 1 : -1));
      }
    });
  }

  const displayedInquiry = inquiryList.filter((x) => x.displayed);

  const model = {
    urlPage: libs.admin.getToolUrl("no.bouvet.app.inquiry", "inquiry"),
    urlCss: libs.portal.assetUrl({ path: "css/admintool.css" }),
    inquiryList: inquiryList,
    displayedInquiry: displayedInquiry.length > 0 ? displayedInquiry[0] : null,
    chartItems: chartItems,
    locale: libs.admin.getLocale() ?? "en"
  };

  const view = resolve("./inquiry.ftl");
  const body = libs.freemarker.render(view, model);

  return {
    contentType: "text/html",
    body: body
  };
};
