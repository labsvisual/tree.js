/*

  Tree.js - The simple, auto-refresh JavaScript script for your next project.
  Handwritten by the good folks over at Isomr, Co. (http://isomr.co)

  Beta Version - 1.0b

  http://isomr.co/tree

  Using Tree.js is pretty simple. Just drop-in this file as a script tag in your
  project, and off you go.

  In case you want a better live-refresh, try using the Tree-Roots server, and
  setting then using Tree.js like this:
    <script src="/path/to/tree.server.js?host=0.0.0.0&post=1000"></script>

  The code for Tree.js is similar to that of Live.js, but has been made much
  simpler.

  NOTE: Tree.js SHOULD and HAS TO BE included last, i.e. after you have
        linked all of your files. For best results, link it last in the <body>.

*/

(function() {

  /* ------- VARIABLE DESCRIPTION ---------

  resourcesCache : Object         => Stores the header information about each of the
                                     tracked resources.

  resourcesToTrack : Array        => Stores the list of files to be tracked for the
                                     current URL.

  interval : Number               => The number of milliseconds after which Tree.js
                                     should check for any changes.
                                     NOTE: If you have a cache-enabled server, set this
                                     to a (little) higher value.

 isDebug : Boolean                => If set to true, prints all the header information
                                     regarding the changed file.

 areResourcesMapped : Boolean     => The internal processing, sets this to true once all
                                     of the resources have been mapped.

 isEnabled : Boolean              => If set to true, Tree.js is enabled; disabled otherwise.

  =========================================== */

  var resourcesCache      = {},
      resourcesToTrack    = [],
      interval            = 5000,
      isDebug             = true,
      areResourcesMapped  = false,
      isEnabled           = true;

  /* - - - - - - - - - - - - - - - - - - - - -
     ----------------------------------------- */

  /* -------------- TREE OBJECT ----------------

  The Tree object houses all of the functions and logic to refresh, list, check
  the DOM and the webpage.

  Function Descriptions:

    checkForTags()                    :=> Checks if there are any tags to modify Tree's configuration.

    init()                            :=> Initializes the library by mapping the resources.

    heartbeat()                       :=> This function is executed once every the set interval.

    mapResources()                    :=> Populates the header cache and the resources list.

    checkForChanges()                 :=> Checks for any changes in any of the files present in
                                          resources list.

    doesFileExist( uri )              :=> Uses a HTTP/1.0 HEAD request to check if a file ( "uri" parameter) exists.

    getHttpObject()                   :=> For max. compatibility, returns either an ActiveX Object
                                          or a standard XMLHttpRequest object, depending what is
                                          available.

    getHeadOfFile( uri, passback )   :=> Gets the HTTP/1.0 HEAD for any file provided and calls the
                                         callback.


  ============================================== */

  var Tree = {

    checkForTags: function() {

      var scriptTags = document.getElementsByTagName('script');
      for ( var i = 0; i < scriptTags.length; i++ ) {

        var currentTag = scriptTags[i];
        if ( (currentTag.getAttribute( 'src' )
                        .toLowerCase()
                        .indexOf('tree') > -1)
                         &&

             ( currentTag.getAttribute( 'src' )
                         .toLowerCase()
                         .indexOf( '#disabled' ) > -1 ) ){

          isEnabled = false;

        }

      }

    },

    init: function() {

      if (!Tree.areResourcesMapped) {

        console.log("Tree.js: Mapping resources.");

        Tree.mapResources();

        console.log("Tree.js: Resources mapped. Initialized.");

        return;

      }

    },

    heartbeat: function() {

      if (!Tree.areResourcesMapped) {
        console.log("Tree.js: Oops! You need to initialize first.");
        return;
      }

      setInterval(Tree.checkForChanges, interval);

    },

    mapResources: function() {

      resourcesToTrack.push(window.location.href);

      var scriptTags = document.getElementsByTagName("script"),
          linkTags   = document.getElementsByTagName("link"),

          rawFileCounter       = (scriptTags.length + linkTags.length),
          processedFileCounter = 0;

      for ( var i = 0; i < scriptTags.length; i++ ) {

        var currentScriptTag    = scriptTags[i],
            currentScriptTagSrc = currentScriptTag.getAttribute("src");

        if ( currentScriptTag.src.indexOf( "Tree.js" ) > -1 ||
             currentScriptTag.src.indexOf( "Tree.min.js" ) > -1 ) {

          continue;

        }

        if ( Tree.doesFileExist( currentScriptTagSrc ) ) {
          resourcesToTrack.push( currentScriptTagSrc );
        }

      }

      if ( linkTags != null || linkTags != undefined || ( linkTags.length > 0 ) ) {

        for ( var i = 0; i < linkTags.length; i++ ) {

          var currentLinkTag    = linkTags[i],
              currentLinkTagSrc = currentLinkTag.getAttribute( "href", 2 );

          if ( !currentLinkTag.rel === "stylesheet" ||
                currentLinkTagSrc.indexOf("blob") > -1 ) {

            continue;
          }

          if ( Tree.doesFileExist( currentLinkTagSrc ) ) {

            resourcesToTrack.push( currentLinkTagSrc );

          }

        }

      }

      for ( var i = 0; i < resourcesToTrack.length; i++ ) {

        var currentResource = resourcesToTrack[i];

        Tree.getHeadOfFile( currentResource, function( info ) {

          resourcesCache[currentResource] = info;

        });

      }

      Tree.areResourcesMapped = true;

    },

    checkForChanges: function() {

      for ( var i = 0; i < resourcesToTrack.length; i++ ) {

        var currentResource      = resourcesToTrack[i],
            currentResourceCache = resourcesCache[currentResource];

        Tree.getHeadOfFile( currentResource, function( info ) {

          var oldEtag = currentResourceCache.etag,
              newEtag = info.etag;

          var oldModified = currentResourceCache['last-modified'],
              newModified = info['last-modified'];

          if ( oldEtag != newEtag ||
               oldModified != newModified ) {

            console.log("Tree.js: Modified file detected " + currentResource +
                        " of type " + currentResourceCache['content-type'] );
            if (isDebug) {

              console.log("Tree.js: \n\t" +
                              "Old e-tag: " + oldEtag +
                              "\n\tNew e-tag: " + newEtag +
                              "\n\tOld Modification Timestamp: " + oldModified +
                              "\n\tNew Modification Timestamp: " + newModified);

            }

            document.location.reload();

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

          info['etag'] = currentHeader.toLowerCase()
                                      .split(":")[1]
                                      .trim();

        } else if ( currentHeader.toLowerCase().indexOf("last-modified") > -1 ) {

          info['last-modified'] = currentHeader.toLowerCase()
                                               .split(":")[1]
                                               .trim();

        } else if ( currentHeader.toLowerCase().indexOf("content-type") > -1 ) {

          info['content-type'] = currentHeader.toLowerCase()
                                              .split(":")[1]
                                              .trim()
                                              .split(";")[0]
                                              .trim();

        } else { continue; }

      }

      passback( info );

    }

  };

  if ( document.location.protocol !== "file:" ) {

    Tree.checkForTags();

    if (isEnabled) {

      Tree.init();
      Tree.heartbeat();
      
    } else { console.log("Tree.js loaded successfully but is disabled."); }

  } else console.log("Tree.js does not play nicely with the file:/// protocol. Try HTTP (or a cookie).");

})();
