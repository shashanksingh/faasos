var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
const readline = require('readline');
const fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/output', function(req,res){
  var line_arr = [];
  var ext = path.extname(req.file.originalname).toLowerCase();
  if(ext == '.txt'){
    var lineReader = readline.createInterface({
      input: fs.createReadStream(req.file.path)
    });
    lineReader.on('line', function (line) {
      lineReader.pause();
      var line_obj = {};
      if(line){
        var line_split = line.split(" ");
        if(line_split[3].indexOf('faasos') > -1){
          var client_ip = line_split[8].split(":");
          var url_request = 'http://ipinfo.io/'+ client_ip[0];
          // lineReader.pause();
          request(url_request,function(error, response, body){
            // console.log(response);

            if(response.statusCode == 200){
              var output = JSON.parse(body);
              if(output.country != 'IN'){
                line_obj.status = 'Yes';
                line_obj.line = line;
              }else{
                line_obj.status = 'No';
                line_obj.line = line;
              }

              line_arr.push(line_obj);
              lineReader.resume();
            }
          });
        }else{
          line_obj.status = 'Yes';
          line_obj.line = line;
          line_arr.push(line_obj);
        }
      }
    }).on('close',function(){
      res.render('output',{data:line_arr,success:true});
    });
  }else{
    res.render('output',{"message":"Not valid extension","success":false});
  }
});

module.exports = router;
