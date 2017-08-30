function (doc) {
    if (doc.deleted !== true) {
        doc.postcodes.forEach(function (pc) { emit(doc._id, pc); });
        doc.uprns.forEach(function (uprn) { emit(doc._id, uprn); });
    }
}
