exports.get = (req) => {
  const idList = [];

  if (req.params.ids) {
    const currentID = req.params.ids;
    idList.push({ id: currentID, displayName: currentID, description: "Current ID" });
  } else {
    const newID = `${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`;
    idList.push({ id: newID, displayName: newID, description: "New ID" });
  }

  const body = {
    count: idList.length,
    total: idList.length,
    hits: idList
  };

  return {
    contentType: "application/json",
    body: body
  };
};
