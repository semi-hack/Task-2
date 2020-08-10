var http = require("http");
var url = require("url");
const fs = require("fs");
const path = require("path");
const { parse } = require("querystring");

var server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);

  //GET ie read content of a file in a specific directory
  if (reqUrl.pathname == "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World Welcome to WeJapa Internships");
  }

  if (reqUrl.pathname == "/note" && req.method === "GET") {
    requestData(req, (result) => {
      name = result.name;
      folder = result.folder;

      if (!fs.existsSync(`./${folder}/${name}`)) {
        res.end("does not exist");
      } else {
        fs.readFile(`./${folder}/${name}`, `utf8`, (err, contentA) => {
          if (err) throw err;
          console.log(contentA);
          res.end(`${contentA}`);
        });
      }
    });
  }

  //P0ST ie creates a txt file and sorts it into the right directory
  if (reqUrl.pathname == "/write" && req.method === "POST") {
    requestData(req, (result) => {
      name = result.name;
      fileContent = result.content;
      folder = result.folder;

      if (!fs.existsSync(`${folder}`)) {
        fs.mkdir(`${folder}`, (err) => {
          if (err) throw err;
          res.end("folder created");
        });
        fs.writeFile(`./${folder}/${name}.txt`, fileContent, (err) => {
          if (err) throw err;
          res.end("created");
        });
      } else if (
        fs.existsSync(`./${folder}`) &&
        !fs.existsSync(`./${folder}/${name}.txt`)
      ) {
        fs.writeFile(`./${folder}/${name}.txt`, fileContent, (err) => {
          if (err) throw err;
          res.end("created");
        });
      } else if (fs.existsSync(`./${folder}/${name}.txt`)) {
        res.end(`./${folder}/${name}.txt already exist.`);
      }
    });
  }

  // UPDATE A FILE
  if (reqUrl.pathname == "/update" && req.method === "PATCH") {
    requestData(req, (result) => {
      name = result.name;
      fileContent = result.content;
      folder = result.folder;

      if (fs.existsSync(`./${folder}/${name}.txt`)) {
        fs.writeFile(`./${folder}/${name}.txt`, fileContent, (err) => {
          if (err) throw err;
          res.end("updated");
        });
      } else {
        console.log("false");
        res.end("file does not exist");
      }
    });
  }

  //get all files in a directory
  if (reqUrl.pathname == "/all" && req.method === "GET") {
    requestData(req, (result) => {
      folder = result.folder

      const summ = fs.readdirSync(`./${folder}`)
      // summ.forEach((dir) => {
      //   const files = fs.readdirSync(`./${dir}`);
      //   summ[dir] = files
      // });
      res.end(JSON.stringify(summ))

    })
  }

  // Delete a file, deletes a directory if the last file is deleted
  if (reqUrl.pathname == "/delete" && req.method === "DELETE") {
    requestData(req, (result) => {
      name = result.name;
      fileContent = result.content;
      folder = result.folder;
      files = fs.readdirSync(`./${folder}`)

      const file = files.find((file) => file === `${name}.txt`)
      if(file) {
        fs.unlink(`./${folder}/${name}.txt`, (err) => {
          if (err) throw err;
          if(files.length === 1) fs.rmdirSync(`./${folder}`)
          res.end(`deleted`)
        })
      }
      
    })
  }
});

function requestData(request, callback) {
  const FORM_URLENCODED = "application/x-www-form-urlencoded";
  if (request.headers["content-type"] === FORM_URLENCODED) {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => {
      callback(parse(body));
    });
  } else {
    callback(null);
  }
}

server.listen(4000, "127.0.0.1");
