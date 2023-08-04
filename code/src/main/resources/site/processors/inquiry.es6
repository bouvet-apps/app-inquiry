const libs = {
  portal: require("/lib/xp/portal"),
  context: require("/lib/xp/context"),
  freemarker: require("/lib/tineikt/freemarker"),
  util: require("/lib/util"),
  i18n: require("/lib/xp/i18n")
};

exports.responseProcessor = (req, res) => {
  const config = libs.portal.getSiteConfig();
  const cookieIdentifier = req.cookies?.inquiryIdentifier;
  const testmode = config.testmode && libs.context.get().branch === "draft";

  // If visitor has already closed/submitted the currently active inquiry then don't display the inquiry again, unless testmode is on.
  if (config.active && config.identifier && (config.identifier !== cookieIdentifier || testmode)) {
    const style = `<link rel="stylesheet" href="${libs.portal.assetUrl({ path: "css/main.css" })}">`;
    const scripts = `<script src="${libs.portal.assetUrl({ path: "js/main.js" })}" async></script>`;

    // Create body html
    const model = {};
    model.identifier = config.identifier;
    model.testmode = testmode;
    model.theme = config.theme ? config.theme : "light";
    model.fontSize = config.fontSize ? config.fontSize.toString() : "";
    model.boxTitle = config.boxTitle ? config.boxTitle : "";
    model.boxText = config.boxText ? libs.portal.processHtml({ value: config.boxText }) : "";
    model.boxContinue = config.boxContinue ? config.boxContinue : "";
    model.boxPosition = config.boxPosition;
    model.boxZindex = config.boxZindex ? config.boxZindex.toString() : "";
    model.popupZindex = config.popupZindex ? config.popupZindex.toString() : "";
    model.popupTitle = config.popupTitle ? config.popupTitle : "";
    model.popupText = config.popupText ? libs.portal.processHtml({ value: config.popupText }) : "";
    model.popupSubmit = config.popupSubmit ? config.popupSubmit : "";
    model.popupResponseTitle = config.popupResponseTitle ? config.popupResponseTitle : "";
    model.popupResponseText = config.popupResponseText ? libs.portal.processHtml({ value: config.popupResponseText }) : "";
    model.popupQuestions = libs.util.forceArray(config.popupQuestions);
    model.popupQuestions.forEach((item) => {
      const popupQuestion = item;
      if (popupQuestion._selected === "radiobuttonAnswer" || popupQuestion._selected === "checkboxAnswer") {
        popupQuestion.answerOptions = libs.util.forceArray(popupQuestion.answerOptions);
      }
    });
    model.inquiryServiceUrl = libs.portal.serviceUrl({ service: "inquiry" });
    model.titleClose = libs.i18n.localize({ key: "close" });
    model.submitError = libs.i18n.localize({ key: "submiterror" });

    const view = resolve("/views/inquiry.ftl");
    const body = libs.freemarker.render(view, model);

    // Check if contribution fields exists, if not create it
    const bodyEnd = res.pageContributions.bodyEnd;
    if (!bodyEnd) {
      res.pageContributions.bodyEnd = [];
    }

    const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
      res.pageContributions.headEnd = [];
    }

    // Add contributions
    res.pageContributions.bodyEnd.push(body);
    res.pageContributions.bodyEnd.push(scripts);
    res.pageContributions.headEnd.push(style);
  }

  return res;
};
