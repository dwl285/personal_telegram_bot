function insertDataBQ(data = [{ date: "foo", user: "bar", question: "?", response: "..."}], tableName = "daily_questions", datasetName = "telegram_dev", projectId = "dan-playground-285") {
  var fields = Object.keys(data[0]).join(", ");
  var values = data.map((row) => Object.values(row).map(i => `"${i}"`).join(", ")).join("), (");
  var query = `INSERT ${datasetName}.${tableName} (${fields}) VALUES(${values});`;
  var request = {
    "configuration": {
      "query": {
        "useLegacySql": false,
        "query": query
      }
    }
  };
  var insertJob = BigQuery.Jobs.insert(request, projectId);
  return insertJob.jobReference.jobId;
}

function getDataBQ(tableName = "daily_questions", datasetName = "telegram_dev", projectId = "dan-playground-285") {
   var request = {
    query: `SELECT * from ${projectId}.${datasetName}.${tableName};`,
    "useLegacySql": false
  };
  var queryResults = BigQuery.Jobs.query(request, projectId);
  var jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }
  
   // Get all the rows of results.
  var rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows);
  }

  // Get the headers.
    var fields = queryResults.schema.fields.map(function(field) {
      return field.name;
    });

    // Get the row results.
    var data = new Array(rows.length);
    for (var i = 0; i < rows.length; i++) {
      var cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (var j = 0; j < cols.length; j++) {
        data[i][j] = cols[j].v;
      }
    }
  
  return({fields: fields, rows: data});
}