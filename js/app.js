     $(document).ready(function () {

         var list = document.getElementById("listChannel");
         var btn = document.getElementById("channel");
         var btnNew = document.getElementById("addChannel");
         var channels = document.getElementById("rss-feeds");
         var badgeChannels, badgeFeeds, badgeAuthors;

         // state contains channel's urls on page
         var state = JSON.parse(localStorage.getItem("object"))
         if (state === null) {
             var state = {
                 listChannel: [
                     {
                         name: "Beetroot",
                         url: "http://feeds.feedburner.com/Rootbeet",
                             },
                     {
                         name: "Stack Overflow",
                         url: "http://stackoverflow.com/feeds"
                 }]
             }
         }

         badgeChannels = state.listChannel.length; //counter for channels
         renderDefault(); // render the first view of page
         $("#badgeChannels").html(badgeChannels);


         function showChannel(url) {
             //function downloads feeds by url, using feednami.load from https://feednami.com/,
             //counts messages and authors 

             feednami.load(url, function (result) {

                 if (result.error) {
                     console.log(result.error)
                 } else {
                     var entries = result.feed.entries
                     var feeds = []
                     var authors = []
                     for (var i = 0; i < entries.length; i++) {
                         var entry = entries[i]
                         var feed = new Object();
                         feed.author = entry.author;
                         authors[i] = feed.author;
                         feed.link = entry.link;
                         feed.date = moment(entry.date).startOf('hour').fromNow();
                         feed.title = entry.title;
                         feed.content = entry.description;
                         feeds[i] = feed;
                     }

                     badgeFeeds = feeds.length;
                     $("#badgeFeeds").html(badgeFeeds)
                     uniq(authors).length
                     badgeAuthors = uniq(authors).length
                     $("#badgeAuthors").html(badgeAuthors)
                     feeds = {
                         feeds
                     }

                     getTemplateAjax("../templates/channel.html", function (template) {
                         $("#rss-feeds").html(template(feeds));
                     })
                 }
             })
         };


         function renderDefault() {
             var source = document.getElementById("templateListChannel").innerHTML;
             var template = Handlebars.compile(source)
             document.getElementById("listChannel").innerHTML = template(state)
             showChannel(state.listChannel[0])
         }


         //show message in right viewer 
         channels.addEventListener("click", function (event) {

             //event handler for selecting message

             if (event.target.className == "list-group-item") {

                 var el = event.target;
                 var content = el.getAttribute("model");
                 var link = el.getAttribute("link");

                 //with using library string.js get text from message without html tags and entities
                 var textContent = S(content).stripTags().decodeHTMLEntities().s.toLowerCase().replace(/[^a-z]/g, '');
                 var tot = textContent.length;

                 //dictionary of letters {'a': letter frequency, etc.} 
                 var dictLat = {};
                 for (var i = 97; i < 123; i++) {
                     dictLat[String.fromCharCode(i)] = 0;
                 }

                 for (var item in textContent) {
                     dictLat[textContent[item]]++;
                 }

                 //constraction of data for pie diagram
                 //using lib Chart.js and canvas

                 var colors = ["#F7464A", "#46BFBD", "#FDB45C"];
                 var pieData = [];
                 for (var i = 97; i < 123; i++) {
                     pieData.push({
                         value: (dictLat[String.fromCharCode(i)] / tot).toFixed(2),
                         label: String.fromCharCode(i),
                         color: colors[i % 3]
                     })
                 };

                 //rendering of diagram
                 renderPie(pieData);
                 //rendering of meassage content in page's panel
                 $("a > h4").html(el.firstChild.nodeValue)
                 $("div.panel-body").html(content);
                 $("div.panel-heading").children()[0].setAttribute("href", link)

                 //rendering of caption for diagram                 
                 $("#captionPie").html("<span style = 'color: blue;'>Letter frequency in message</span> ").append(el.firstChild.nodeValue)


             }
         })

         // remove or show channel (left viewer event handler)
         list.addEventListener("click", function (event) {


             if (event.target.className == "glyphicon glyphicon-remove") {
                 var li = event.target.parentNode.parentNode
                 li.parentNode.removeChild(li)

                 for (var i in state.listChannel) {

                     if (state.listChannel[i].url == li.title) {

                         state.listChannel.splice(i, 1);
                         break;
                     }
                 }
                 localStorage.setItem("object", JSON.stringify(state));
                 $("#badgeChannels").html(badgeChannels - 1);

             } else if (event.target.className == "list-group-item list-group-item-info") {

                 var el = event.target;

                 var url = el.title;
                 showChannel(url)
             }

         })

         //add channel         
         btnNew.addEventListener("click", function () {
             var nameV = $("#name").val();
             var urlV = $("#url").val();
             var context = {
                 name: nameV,
                 url: urlV
             }

             state.listChannel.push(context);

             getTemplateAjax("../templates/li.html", function (template) {
                 $("#listChannel").append(template(context));

             })

             localStorage.setItem("object", JSON.stringify(state));
             $("#badgeChannels").html(badgeChannels++);
         })


         //snippet for handlebars template from http://www.jblotus.com/2011/05/24/keeping-your-handlebars-js-templates-organized/
         function getTemplateAjax(path, callback) {
             var source, template;
             $.ajax({
                 url: path,
                 success: function (data) {
                     source = data;
                     template = Handlebars.compile(source);
                     if (callback) callback(template);
                 }
             });
         }


         // use in counting of authors         
         function uniq(array) {
             var result = array.slice();

             for (var i = 0; i < result.length; i++) {
                 if (result.indexOf(result[i], i + 1) !== -1) {
                     result.splice(i--, 1);
                 }
             }
             return result;
         }


         function renderPie(pieData) {
             $("#canvasWrapper").html("").html('<canvas id="pie" width="190" height="190"></canvas>');
             var el = document.getElementById('pie');
             var ctx = el.getContext('2d');
             var pieChart = new Chart(ctx).Pie(pieData, {
                 responsive: true
             });
         }

     })
