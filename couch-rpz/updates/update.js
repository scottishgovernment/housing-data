function (doc, req) {
    // copy existing values to the history
    const clone = JSON.parse(JSON.stringify(doc));
    delete clone.history;
    delete clone._revisions;
    delete clone._id;

    doc.history.push(clone);

    // copy values from request body
    const body = JSON.parse(req.body);
    doc.name = body.name;
    doc.fromDate = body.fromDate;
    doc.toDate = body.toDate;
    doc.maxIncrease = body.maxIncrease;
    doc.postcodes = body.postcodes;
    doc.uprns = body.uprns;
    doc.deleted = body.deleted;
    doc.username = body.username;
    doc.timestamp = body.timestamp;

    return [doc, 'DONE'];
}
