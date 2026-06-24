const libs = {
  node: require("/lib/xp/node"),
  repo: require("/lib/xp/repo"),
  util: require("/lib/util")
};

const {
  REPOSITORIES: {
    INQUIRY
  },
  BRANCHES: {
    MASTER
  },
  NODE: {
    PATH,
    NAME
  }
} = require("/lib/enums");

exports.checkRepo = () => {
  // Check if there is already a repo and parent path, if not create them
  const repoExist = libs.repo.get(INQUIRY);

  if (!repoExist) {
    const repoCreated = libs.repo.create({ id: INQUIRY });

    if (repoCreated) {
      log.info(`Repository [${INQUIRY}] created.`);
    } else {
      log.error(`Failed to create repository [${INQUIRY}].`);
      return false;
    }
  }

  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  const pathExist = repoConn.exists(PATH);

  if (!pathExist) {
    const pathCreated = repoConn.create({ _name: NAME });

    if (pathCreated) {
      log.info(`Path [${PATH}] created.`);
    } else {
      log.error(`Failed to create path [${PATH}].`);
      return false;
    }
  }

  return true;
};

exports.saveInquiry = (identifier, questions) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  // Check if there is already a parent node with given identifier, if not create one, else update existing node
  if (!repoConn.exists(`${PATH}/${identifier}`)) {
    return repoConn.create({
      _parentPath: PATH,
      _name: identifier,
      questions: questions
    });
  }

  return repoConn.modify({
    key: `${PATH}/${identifier}`,
    editor: function(x) {
      const editNode = x;
      editNode.questions = questions;
      return editNode;
    }
  });
};

exports.saveAnswers = (identifier, answers) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  // Save the answers in a child node
  const _answers = {};
  _answers._parentPath = `${PATH}/${identifier}`;
  _answers.answers = answers;

  return repoConn.create(_answers);
};

exports.deleteInquiry = (identifier) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  repoConn.delete(`${PATH}/${identifier}`);
};

exports.getAnswers = (identifier) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  // Get all node data in multiple chunks
  const nodesTotal = repoConn.findChildren({
    parentKey: `${PATH}/${identifier}`,
    countOnly: true
  }).total;

  const nodesChunksize = 2000;
  let nodesRetrieved = 0;
  const nodeData = [];

  while (nodesRetrieved < nodesTotal) {
    // Get node ID's
    const nodeChildren = repoConn.findChildren({
      parentKey: `${PATH}/${identifier}`,
      start: nodesRetrieved,
      count: nodesChunksize
    });
    const nodeIDs = nodeChildren.hits.map((x) => x.id);

    // Get nodes
    // TODO: when fetching thousands of answers, repo.get() can get slow. May need to rethink how the answer data is fetched/processed.
    const nodes = libs.util.forceArray(repoConn.get(...nodeIDs));

    nodeData.push(...nodes);
    nodesRetrieved += nodesChunksize;
  }

  return nodeData;
};

exports.getInquiries = () => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  const nodeChildren = repoConn.findChildren({
    parentKey: PATH,
    count: 999
  });

  const nodeIDs = nodeChildren.hits.map((x) => x.id);
  const nodes = repoConn.get(...nodeIDs);

  return nodes;
};

exports.getInquiry = (id) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  const node = repoConn.get(id);

  return node;
};

exports.getChildrenCount = (id) => {
  const repoConn = libs.node.connect({
    repoId: INQUIRY,
    branch: MASTER
  });

  const nodes = repoConn.findChildren({
    parentKey: id,
    countOnly: true
  });

  return nodes.total;
};

exports.generateTestInquiry = (inquiryToCopy, inquiryName, totalReplies) => {
  const count = totalReplies > 10000 ? 10000 : totalReplies;
  const identifier = `${inquiryName}-test`;
  const questions = libs.util.forceArray(inquiryToCopy.questions);

  exports.saveInquiry(identifier, questions);

  const randomTextArray = [
    "A hamster playing the piano? ",
    "A cat riding a bike? ",
    "A skateboarding dog? ",
    "Pineapple pizza? ",
    "Very short shorts! ",
    "Can there be such a thing? ",
    "How did this happen? ",
    "Why not? ",
    "We can build it, we have the technology. ",
    "Life... finds a way. ",
    "Look! ",
    "Yes! ",
    "No! ",
    "Euhm... ",
    "Hmmm... "
  ];

  for (let i = 0; i < count; i++) {
    const answers = {};

    questions.forEach((question) => {
      const id = question[question._selected].id;

      if (question._selected === "radiobuttonAnswer" || question._selected === "checkboxAnswer") {
        const answerOptions = libs.util.forceArray(question[question._selected].answerOptions);
        answers[id] = libs.util.getRandomElement(answerOptions).text;
      } else if (question._selected === "textareaAnswer") {
        const randomNumber = libs.util.getRandomElement([1, 2, 3, 4, 5, 6, 7, 8, 9, 30]);
        let randomText = "";
        for (let j = 0; j < randomNumber; j++) {
          randomText += libs.util.getRandomElement(randomTextArray);
        }
        answers[id] = randomText;
      } else {
        answers[id] = libs.util.getRandomElement(randomTextArray);
      }
    });

    exports.saveAnswers(identifier, answers);
  }
};
