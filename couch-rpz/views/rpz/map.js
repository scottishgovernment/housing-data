function (doc) {
    if (doc.deleted !== true) {
        const clone = JSON.parse(JSON.stringify(doc));
        delete clone.history;
        emit(doc.name, clone);
    }
}
