function (doc) {
    if (doc.type === 'cpi') {
        emit(doc.releaseDate);
    }
}
