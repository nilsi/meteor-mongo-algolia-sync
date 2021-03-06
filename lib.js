CollectionExtensions.addPrototype('syncAlgolia', function(algoliaIndex, options) {

  options = options || {};
  var Collection = this;
  Collection.after.insert(function(userId, doc) {
    if (options.transform) doc = options.transform(doc) || {};
    if (!doc) return;
    doc.objectID = doc._id;
    algoliaIndex.saveObjects([doc], function (error, content) {
      if (!options.debug) return;
      if (error) console.error('Error inserting algolia doc.', error);
      else console.log('Inserted Algolia doc.', content);
    });
  });

  Collection.after.update(function(userId, doc, fieldNames, modifier, opts) {
    if (options.transform) doc = options.transform(doc) || {};
    if (!doc) return;
    doc.objectID = doc._id;
    algoliaIndex.saveObjects([doc], function (error, content) {
      if (!options.debug) return;
      if (error) console.error('Error updating algolia doc.', error);
      else console.log('Updated Algolia doc.', content);
    });
  }, { fetchPrevious: false });

  Collection.after.remove(function(userId, doc) {
    algoliaIndex.deleteObjects([doc._id], function(error, content) {
      if (!options.debug) return;
      if (error) console.error('Error removing algolia doc.', error);
      else console.log('Removed Algolia doc.', content);
    });
  });

});

CollectionExtensions.addPrototype('initAlgolia', function(algoliaIndex, options) {

  options = options || {};
  var Collection = this;
  var mongoSelector = options.mongoSelector || {};
  var mongoOptions = options.mongoOptions || {};
  var docs = Collection.find(mongoSelector, mongoOptions).fetch();
  docs = _.map(docs, function(doc) {
    if (options.transform) doc = options.transform(doc) || {};
    doc.objectID = doc._id;
    return doc;
  });
  if (options.clearIndex) {
    algoliaIndex.clearIndex(function(err, content) {
      if (options.debug) console.log('Cleared Algolia index.');
      algoliaIndex.saveObjects(docs, function (error, content) {
        if (!options.debug) return;
        if (error) console.error('Error initiating algolia sync.', error);
        else console.log('Initiated algolia sync.', content);
      });
    });
  } else {
    algoliaIndex.saveObjects(docs, function (error, content) {
      if (!options.debug) return;
      if (error) console.error('Error initiating algolia sync.', error);
      else console.log('Initiated algolia sync.', content);
    });
  }

});
