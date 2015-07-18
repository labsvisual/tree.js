# Tree.js
## Automatic Browser Refresh for Front-End Developers
---

Tree.js is a minimalist library for the average front-end developer to quickly implement live-reload across his project. It auto-refreshes the page when one of the included HTML, JS or CSS files is changed.

A project made by the nice people over at [Isomr, Co.](http://isomr.co)


## Getting Started
Getting started with Tree.js is extremely simple. To add instant auto-refresh to your project, simply include the library **at the end of the body tag** and you're good to go.

```html
<body>

  ...
  ...
  ...

  <script src="path/to/tree.min.js"></script>

</body>
```

Done! No kidding, you're done. Now go and make some changes to your files and see it refresh on it's own.

## Using a CDN
The folks over at [maxcdn](http://maxcdn.com) have been rather generous and have provided this project with its own CDN URL. You can use that one for fater loading times from their **global** content-distribution network.

To leverage it, change the `src` attribute of the `script` tag to point to `//fill-in-the-url` and off you go.

## Quirks
Now, since Tree.js works by getting in all of the `link` and `script` tags of the page **before** it, you **will** have to include it last; make sure that this file is the last one to be included.

Incase you're wondering why so, it's because, the moment your browser fetches Tree.js, it executes the script which contains a function indexing all of the files. Since it starts the moment it's loaded, it traverses over all of the already-loaded elements (parsed HTML); so, if your scripts/CSS files are below Tree.js's inclusion point, it won't add them to the resources' list.

Another problem you can run into is that Tree.js is not working. Now, this can be caused if you have a cache control in the server and the timings are cancelling each other out. For example, NodeJS' `http-server` has the default cache timing of **320 seconds** and I ran into a couple of problems while working with it; the fix was pretty simple, add the `-c-1` flag. So, to start the server and use it with Tree.js, start it like this: `http-server -c-1` and you're ready. :)

## Problems
If you think that you have the courage to download the repository, fix the code and then push it back again, feel free. :)

--

[Tree.js Official Website](http://isomr.co/treejs)

Shreyansh Pandey ([334@doonschool.com](mailto:334@doonschool.com))
