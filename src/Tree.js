/*

  Tree.js - The simple, auto-refresh JavaScript script for your next project.
  Handwritten by the good folks over at Isomr, Co. (http://isomr.co)

  Beta Version - 1.0b

  http://isomr.co/live

  Using Tree.js is pretty simple. Just drop-in this file as a script tag in your
  project, and off you go.

  In case you want a better live-refresh, try using the Tree-Roots server, and
  setting then using Tree.js like this:
    <script src="/path/to/tree.js"></script>
    <script>
      var treeConf = {
        isTreeRoots: true,
        "treeRoots": "localhost:port"
      };
    </script>

  The code for Tree.js is similar to that of Live.js, but has been made much
  simpler.

*/

(function() {

  var headerToTrack       = { "Etag": null, "Last-Modified": null },
      resourcesCache      = {},
      resourcesToTrack    = [],
      requestsStack       = {},
      interval            = 5000,
      isDevelopment       = true,
      isInitialized       = false,
      areResourcesMapped  = false;

  var Tree = {

    init: function() {

      if (!Tree.areResourcesMapped) {
        Tree.mapResources();
        console.log("INITIALIZE....");
        return;
      }

    },

    heartbeat: function() {

      if (!Tree.areResourcesMapped) {
        console.log("Oops! You need to initialize first.");
        return;
      }

      setInterval(Tree.checkForChanges, Tree.interval);

    },

    mapResources: function() {

      resourcesToTrack.push(window.location.href);

      var scriptTags = document.getElementsByTagName("script"),
          linkTags   = document.getElementsByTagName("link"),

          rawFileCounter       = (scriptTags.length + linkTags.length),
          processedFileCounter = 0;

      console.log(scriptTags.length);

      for ( var i = 0; i < scriptTags.length; i++ ) {

        var currentScriptTag    = scriptTags[i],
            currentScriptTagSrc = currentScriptTag.getAttribute("src");

        if ( currentScriptTag.src.indexOf( "Tree.js" ) > -1 ||
             currentScriptTag.src.indexOf( "Tree.min.js" ) > -1 ) {

          //processedFileCounter++;
          continue;

        }

        if ( Tree.doesFileExist( currentScriptTagSrc ) ) {
          resourcesToTrack.push( currentScriptTagSrc );
          //processedFileCounter++;
        }

      }

      console.log("After indexing all JavaScript files, the count is " + resourcesToTrack.length);

      if ( linkTags != null || linkTags != undefined || ( linkTags.length > 0 ) ) {

        for ( var i = 0; i < linkTags.length; i++ ) {

          var currentLinkTag    = linkTags[i],
              currentLinkTagSrc = currentLinkTag.getAttribute( "href", 2 );

          if ( !currentLinkTag.rel === "stylesheet" ||
                currentLinkTagSrc.indexOf("blob") > -1 ) {

            //processedFileCounter++;
            continue;
          }

          if ( Tree.doesFileExist( currentLinkTagSrc ) ) {
            resourcesToTrack.push( currentLinkTagSrc );
            //processedFileCounter++;
            console.log("The count is " + resourcesToTrack.length);
          }

        }

      }

      for ( var i = 0; i < resourcesToTrack.length; i++ ) {

        var currentResource = resourcesToTrack[i];

        Tree.getHeadOfFile( currentResource, function( info ) {

          resourcesCache[currentResource] = info;

        });

      }

      /*Tree.areResourcesMapped = (rawFileCounter === processedFileCounter);
      if (Tree.areResourcesMapped)
        console.log("Yo");*/

      Tree.areResourcesMapped = true;

    },

    checkForChanges: function() {

      //console.log(resourcesToTrack.length);

      for ( var i = 0; i < resourcesToTrack.length; i++ ) {

        var currentResource      = resourcesToTrack[i],
            currentResourceCache = resourcesCache[currentResource];

        Tree.getHeadOfFile( currentResource, function( info ) {
          //console.clear();
          /*console.log(//"For file " + currentResource + "\n" +
                       //"Old ETag " + currentResourceCache.etag +
                       "\nFileName: " + currentResource +
                       "\nNew Etag " + info.etag +
                       "\nisDifferent: " + (!currentResourceCache.etag === info.etag));*/

          if (currentResourceCache.etag != info.etag) {

            console.log(currentResource + " was modified.");

          }

        });

      }


    },

    doesFileExist: function( uri ) {

      var httpObject = Tree.getHttpObject();

      httpObject.open("HEAD", uri, false);
      httpObject.send();

      return (httpObject.status !== 404);

    },

    getHttpObject: function() {

      return (window.XMLHttpRequest) ?
              new XMLHttpRequest()   :
              new ActiveXObject("Microsoft.XmlHttp");

    },

    getHeadOfFile: function( uri, passback ) {

      var httpObject = Tree.getHttpObject();

      httpObject.open( "HEAD", uri, false );

      httpObject.send();

      var headers            = httpObject.getAllResponseHeaders().trim().split("\n");
      var parsedHeadersStack = null;

      var info = {};

      for ( var i = 0; i < headers.length; i++ ) {

        var currentHeader = headers[i];
        if ( currentHeader.toLowerCase().indexOf("etag") > -1 ) {

          info['etag'] = currentHeader.toLowerCase().split(":")[1].trim();

        } else if ( currentHeader.toLowerCase().indexOf("last-modified") > -1 ) {

          info['last-modified'] = currentHeader.toLowerCase().split(":")[1].trim();

        } else { continue; }

      }

      passback( info );

    }

  };

  if ( document.location.protocol !== "file:" ) {

    Tree.init();
    Tree.heartbeat();

  } else console.log("Tree.js does not play nicely with the file:/// protocol. Try HTTP (or a cookie).");

})();
