const libs = {
  portal: require("/lib/xp/portal"),
  content: require("/lib/xp/content"),
  context: require("/lib/xp/context"),
  freemarker: require("/lib/tineikt/freemarker"),
  util: require("/lib/util"),
  i18n: require("/lib/xp/i18n")
};

exports.responseProcessor = (req, res) => {
  const site = libs.portal.getSite();
  const page = libs.portal.getContent();
  if (!site || !page) {
    return res;
  }

  const inquiries = libs.content.query({
    count: -1,
    contentTypes: [`${app.name}:inquiry`],
    query: {
      boolean: {
        must: [
          { pathMatch: { field: "_path", path: `/content${site._path}`, minimumMatch: 1 } },
          { term: { field: "data.active", value: true } }
        ]
      }
    },
    sort: "_path ASC"
  }).hits;
  const matchingInquiries = [];
  for (let index = 0; index < inquiries.length; index += 1) {
    const item = inquiries[index];
    const inquirySite = libs.content.getSite({ key: item._id });
    const targeting = item.data.targeting;
    const matchesPage = targeting?._selected === "allPages"
      || (targeting?._selected === "specificPages" && libs.util.forceArray(targeting.specificPages?.pages).indexOf(page._id) !== -1);
    const isTestmode = item.data.testmode && libs.context.get().branch === "draft";
    if (inquirySite?._id === site._id && matchesPage
      && (!req.cookies?.[`inquiry-${item._id}`] || isTestmode)) {
      matchingInquiries.push(item);
    }
  }
  matchingInquiries.sort((first, second) => Number(second.data.targeting?._selected === "allPages")
    - Number(first.data.targeting?._selected === "allPages"));
  if (matchingInquiries.length === 0) {
    return res;
  }

  // Check if contribution fields exists, if not create them
  if (!res.pageContributions.bodyEnd) {
    res.pageContributions.bodyEnd = [];
  }
  if (!res.pageContributions.headEnd) {
    res.pageContributions.headEnd = [];
  }

  for (let index = 0; index < matchingInquiries.length; index += 1) {
    const inquiry = matchingInquiries[index];
    const config = inquiry.data;
    const testmode = config.testmode && libs.context.get().branch === "draft";

    // Create body html
    const model = {};
    model.identifier = inquiry._id;
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
    model.checkboxRequired = libs.i18n.localize({ key: "site.checkbox-required" });

    const view = resolve("/views/inquiry.ftl");
    const body = libs.freemarker.render(view, model);
    res.pageContributions.bodyEnd.push(body);
  }

  // Add shared assets once for all matching inquiries
  const style = `<link rel="stylesheet" href="${libs.portal.assetUrl({ path: "css/main.css" })}">`;
  const scripts = `<script src="${libs.portal.assetUrl({ path: "js/main.js" })}" async></script>`;
  res.pageContributions.bodyEnd.push(scripts);
  res.pageContributions.headEnd.push(style);

  return res;
};
