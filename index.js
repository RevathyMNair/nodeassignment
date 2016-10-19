const express = require('express')  
const app = express()  
const port = 3474
const path = require('path') 
const exphbs = require('express-handlebars');
var dialog = require('dialog');
var bodyParser = require('body-parser');
var html='';
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

//use of handlebars for routing
app.engine('.hbs', exphbs({  
  defaultLayout: 'index',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views')
}));
app.set('view engine', '.hbs');  
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));//handlebars ends

app.get('/', (req, res) => {  
  	res.render("home",{});
});

app.get('/login', function (req, res) {
  res.render("login",{});
});

app.get('/signup', function (req, res) {
  res.render('signup',{});
});

app.get('/userhome', function (req, res) {
  var name=req.query.name;
  res.render('userhome',function(){
    res.send(name);
  });
});

app.get('/forgot', function (req, res) {
  var name=req.query.name;
  res.render('forgot',{  });
});
//routing ends

app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})
var uname="";
//dbconnection starts
var mongo=require('mongodb');
var mongoClient=mongo.MongoClient;
var url="mongodb://revathy:revathy@ds059516.mlab.com:59516/details";
mongoClient.connect(url,function(err,db){
  var uc=db.collection("user1");
  var pos=db.collection("post");
  app.post('/fnsignup',function(fnreq,fnres){
      var uname=fnreq.body.uname;
      var pass=fnreq.body.pword;
      var passc=fnreq.body.pwordc; 
      if(pass==passc){
        var arr=uc.find({username:uname}).toArray(function(e,o){
          if(o.length==0){
            uc.insert({username: uname, password: pass});
            fnres.redirect('/login');
          }
          else{
            fnres.send('<h3 style="text-align:center;padding:30px">This name already exist</h3><a href="/signup"><input type="submit" value="Go back">')
            dialog.info("This name already exist");
          }
        });
      }
      else{
        dialog.info("Password error");
        fnres.redirect('/signup');   
      }
  });//fnsignup ends
  
  app.post('/fnlogin',function(fnreq,fnres){
     uname=fnreq.body.uname;
      var pass=fnreq.body.pword;
      var arr=uc.find({username:uname}).toArray(function(e,o){
        if(o[0].password==pass){
          // fnres.redirect('/userhome?name='+uname);
          var s=pos.find({username:uname}).toArray(function(e,o){
            // console.log(o);
             html='<p class="re"><a href="/login"><p class="col-xs-12 pull-right"><input type="submit" value="LogOut"></p></a><p class="col-xs-6">What is in your mind??</p><input type="text" class="col-xs-4" name="post"><p class="col-xs-6 pull-right"><a href="/fnpost?post"><input type="submit" name="Send"></p></a></p>';
            for (var i = 0; i < o.length; i++) {
              html+='<h1>'+o[i].post+'</h1>';
            }
            fnres.redirect('/userhome?name='+html);
                 
          });
        }
        else
          fnres.redirect('/login');
      }); 
  });//fnlogin ends


  app.post('/fnforgot',function(fnreq,fnres){
      uname=fnreq.body.uname;
      var pass=fnreq.body.newpass;
      var passc=fnreq.body.newpassc;
      if(pass==passc){
        // uc.update({username:uname},{$set:{username:uname,password:pass}});
        fnres.redirect('/login');
      }
  }); 

   app.get('/fnpost',function(fnreq,fnres){
      var post=fnreq.query.post;
      pos.insert({username:uname,post:post});
      fnres.send(html);
      // fnres.redirect("/userhome");
  });
});  //database connection ends   

  // 