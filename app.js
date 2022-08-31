// import fetch from "node-fetch";

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const request = require("request");
// const nodeFetch = require("node-fetch");

// const promise = nodeFetch.fetch


app = express();

app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/tssDB")

const videogameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageFile: {
    type: String,
    required: true
  }
});

const VideoGame = new mongoose.model("VideoGame", videogameSchema);

const evio = new VideoGame ({
  name: "Ev.io",
  imageFile: "Evio-img.jpg"
});

const lol = new VideoGame ({
  name: "League of Legends",
  imageFile: "LoL-img.jpg"
});



const videoGameList = [evio];




// ----- Home Route ----- //

app.route("/")

.get(function(req, res){
  res.render("index");
});


app.route("/login")

.get(function(req, res){
  res.render("login");
});


app.route("/sign-up")

.get(function(req, res){
  res.render("sign-up");
});


app.route("/game-stats")

.get(function(req, res){
  videoGameList.forEach(function(game){
    VideoGame.findOne({name: game.name}, function(err, foundVideoGame){
      if (err){
        console.log(err);
      } else {
        if (foundVideoGame){
          // console.log(foundVideoGame);
        } else {
          game.save();
          res.redirect("/game-stats");
        }
      }
    });
  });
  VideoGame.find({}, function(err, foundGames){
    res.render("game-stats", {allGames: foundGames});
  });
});



app.route("/game-stats/:gameName")

.get(function(req, res){

// ----- If route is Ev.io ----- //
  if (req.params.gameName === "Ev.io"){
    const clanMemberIds = [];
    const clanMembers = [];

    res.render("evio-stat-page", {
      gameName: req.params.gameName,
      clanName: "Clan Name",
      clanMemberIds: clanMemberIds,
      totalClanPoints: "totalClanPoints",
      clanMembers: clanMembers
    });

  } else if (req.params.gameName === "League of Legends") {

    res.render("LoL-stat-page");

  // } else if (req.params.gameName === "Axie Infinity") {
  //   request({url:"https://graphql-gateway.axieinfinity.com/graphql", qs: {
  //     roninAddress: "0x2ebd51e17b56e9cea3317e8d13ab99ffb168427c"
  //   }}, function(err, response, body){
  //     log("hi")
  //   });
  //
  //   res.render("Axie-stat-page");

  } else {
// ----- Placeholder Route ----- //
    res.render("placeholder-stat-page");
  }
})


.post(function(req, res){

// ----- If route is Ev.io ----- //
  if (req.params.gameName === "Ev.io"){
    const clanId = req.body.clanId;
    const clanMembers = [];

    request(`https://ev.io/group/${clanId}?_format=json`, function(err, response, body){
      if (response.statusCode == 404){
        res.render("evio-stat-page", {
          gameName: req.params.gameName,
          clanName: "Bad Clan ID",
          clanMembers: [],
      });
      } else {
        const jsonBody = JSON.parse(body);
        const clanName = jsonBody.label[0].value;

        if (jsonBody.field_deployed.length === 0){
          res.render("evio-stat-page", {
            gameName: req.params.gameName,
            clanName: clanName + " (Has no members)",
            clanMembers: [],
        });

      } else {
        var clanMembersInfo = jsonBody.field_deployed;
        var clanMemberIds = [];
        const totalClanPoints = jsonBody.field_clan_points[0].value;





          // clanMembersInfo.forEach(function(member)
        for (var i = 0; i < clanMembersInfo.length; i++) {
            clanMemberIds.push(clanMembersInfo[i].target_id);

            request(`https://ev.io/user/${clanMembersInfo[i].target_id}?_format=json`, function(err, response, body){
              // console.log(JSON.parse(body));
              var memberData = JSON.parse(body);

              var newMember = {
                username: memberData.name[0].value,
                totalKills: memberData.field_kills[0].value,
                kdRatio: memberData.field_k_d[0].value,
              };
              clanMembers.push(newMember);

              if (clanMemberIds.length === clanMembers.length){
                res.render("evio-stat-page", {
                  gameName: req.params.gameName,
                  clanName: clanName,
                  clanMembers: clanMembers,
                  // clanMemberIds: clanMemberIds,
                  // totalClanPoints: totalClanPoints
              });
            };
          });
        };
      }


      }

    });

  } else if (req.params.gameName === "League of Legends") {

    res.render("LoL-stat-page");

  } else if (req.params.gameName === "Axie Infinity") {

    res.render("Axie-stat-page");

  } else {
// ----- Placeholder Route ----- //
    res.render("placeholder-stat-page");
  }


});







app.listen(3000, function(){
  console.log("Server running on port 3000");
});




// function getMemberObjects(body){
//
//     const jsonBody = JSON.parse(body);
//     const clanMembersInfo = jsonBody.field_deployed;
//     const clanMemberIds = [];
//     const clanMembers = [];
//
//
//     // clanMembersInfo.forEach(function(member)
//     for (member of clanMembersInfo){
//       clanMemberIds.push(member.target_id);
//
//       request(`https://ev.io/user/${member.target_id}?_format=json`, function(err, response, body){
//         // console.log(JSON.parse(body));
//         var memberData = JSON.parse(body);
//
//         var newMember = {
//           username: memberData.name[0].value,
//           // brWins: memberData.field_battle_royale_wins[0].value,
//           brWinsWeekly: memberData.field_battle_royale_wins_weekly[0].value,
//           totalKills: memberData.field_kills[0].value,
//           kdRatio: memberData.field_k_d[0].value,
//         };
//         // console.log(newMember);
//         clanMembers.push(newMember);
//
//       });
//     };
//
//
//   return newPromise;
// };
//
//
// async function renderEvioStatPage(body, req, res){
//   getMemberObjects(body).then(function(message){
//     console.log(message);
//   });
//   // setTimeout(function(){
//   //   console.log(clanMembers);
//   // }, 500)
//   // const log = console.log(clanMembers);
//   console.log("Should have printed");
//
//   res.render("evio-stat-page", {
//     gameName: req.params.gameName,
//     clanName: "clanName",
//     clanMemberIds: ["clanMemberIds"],
//     totalClanPoints: "totalClanPoints"
// });
// };
