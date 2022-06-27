const axios = require('axios').default;
const $rdf = require('rdflib');
const fs = require('fs');

let urlToCheck = "https://global.dbpedia.org/same-thing/lookup/?uri=http://www.wikidata.org/entity/Q64"

var store = $rdf.graph()
var timeout = 5000 // 5000 ms timeout
var fetcher = new $rdf.Fetcher(store, timeout)


// var access = fs.createWriteStream('./log/api.access.log');
// process.stdout.write = process.stderr.write = access.write.bind(access);

// process.on('uncaughtException', function(err) {
//     console.error((err && err.stack) ? err.stack : err);
//   });
  

async function rdfHttpRequest(url){
    try {
      const URL = url;

      const config = {
        headers: { "Accept": ["application/n-triples"] }, //, "text/turtle", "application/rdf+xml"
      };

      const response = await axios.get(URL, config);
      return response;

    } catch (error) {
        // console.log(url + " ERROR 404 not found");
        writeToFile('./log/404.txt', url + ": 404 NOT FOUND --> " + error + "\n")
    }
  }

function writeToFile(file, data){
    try {
        fs.appendFileSync(file, data);
        // file written successfully
      } catch (err) {
        console.error(err);
      }
}

async function getLinksOfGlobal(globalURL){
    try {
      const URL = globalURL
      const response = await axios.get(URL);

      return response.data.locals;
    } catch (error) {
      console.error(error);
    }
}

async function gatherData(globalURL){

    const linksOfGlobal = await getLinksOfGlobal(globalURL);

    for (var i=0;i<=50; i++) {
        console.log(i);
        console.log(linksOfGlobal[i]);

        let response = await rdfHttpRequest(linksOfGlobal[i]);
        
        // console.log(response);
        if (response!=null){
            if(response.status == 200){
                let mimeType = response.headers['content-type']
                console.log(mimeType)

                try{
                    await fetcher.load(linksOfGlobal[i]);
                } catch (error) {
                    console.log(error);
                }
                // fetcher.nowOrWhenFetched(linksOfGlobal[i], function(ok, body, response) {
                //     if (!ok) {
                //         console.log("Oops, something happened and couldn't fetch data " + body);
                //     } else if (response.onErrorWasCalled || response.status !== 200) {
                //         console.log('    Non-HTTP error reloading data! onErrorWasCalled=' + response.onErrorWasCalled + ' status: ' + response.status)
                //     } else {
                //          console.log("---data loaded---")
                // }})

                // try{
                    
                // } catch (error) {
                //     console.log(error);
                //     // if (error.response['size']==0){
                //     //     writeToFile('./log/303.txt', linksOfGlobal[i] + " : No Data. Empty Response. \n")
                //     // }
                // }
                
                // console.log(response);
            } else {
                console.log(response.status);
            }

        } 
        // console.log("nowTEST");
        // try{
        //     
        // } catch (error) {
        //     console.error(error);
        // }
    

        
    };



    // var friends = store.each(undefined, undefined, undefined)
    // for (var i=0; i<friends.length;i++) {
    //     friend = friends[i];
    //     console.log(friend.uri)
    // }


}

(async() => {

    await gatherData(urlToCheck);

    var friends = store.statementsMatching(undefined, undefined, undefined)
    for (var i=0; i<friends.length;i++) {
        friend = friends[i];
        console.log(friend);
        console.log(friend.object.uri);
    }
})();


