const express = require('express');
const userRoute = require('./routes/UserRoute');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/User');
const Address = require('./models/Address');

mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });

app.use(express.json());

app.post('/testmg/address', (req,res)=>{
  let {city, country} =req.body;
  let address =new  Address({city:city, country:country});
  return address.save()
  .then(data=> res.send(data))
  .catch(err=> res.send(err))
})
app.put('/testmg', (req, res) => {
	return User.update(
		{ _id: { $ne: '5d49509c53ef842e467840fc' } },
		{ name: req.body.name }
	)
		.exec()
		.then(data => res.send(data))
		.catch(err => console.log(err));
});

app.get('/testmg', (req,res)=>{
  return User.aggregate([
    {
    $lookup: {
        from: "addresses",
        localField: "address",
        foreignField: "_id",
        as: "address",
      }
    },
    {
      $lookup: {
        from: "districts",
        localField: "address.district",
        foreignField: "_id",
        as: "district"
      }
    },
    // {$match: {"address.country": 'VN', "district.name": "Hai Chau"}},
    {$unwind: "$address"},
    {$group: {_id: "$address.city", count: {$sum: 1}}},
    {$sort:{"count": -1}},
    // { '$facet'    : {
    //   metadata: [ { $count: "total" } ],
    //   data: [ { $skip: 0 }, { $limit: 10 }, {$project: {
    //     "_id": 0,
    //     "name": 1,
    //     "age": 1,
    //     "address.city": 1,
    //     "district.name": 1
    //     }}]
    // }}
  ])
  .exec()
  .then(data=> res.send(data))
  .catch(err=> res.send(err));
})
app.use('/users', userRoute);

app.listen(3000, () => {
	console.log('Server is listening at port 3000');
});

// -----------------------------------------------
// db.getCollection('applications').aggregate([
//   {$lookup: {
//       from: "commissioners",
//       localField: "commissioner",
//       foreignField: "_id",
//       as: "commissioner",
//     },
//   },
//   {$lookup: {
//       from: "teams",
//       localField: "commissioner.team",
//       foreignField: "_id",
//       as: "team",
//     },
//   },
//   {$lookup: {
//       from: "branches",
//       localField: "team.branch",
//       foreignField: "_id",
//       as: "branch",
//     },
//   },
//   {$lookup: {
//       from: "agencies",
//       localField: "branch.agency",
//       foreignField: "_id",
//       as: "agency",
//     },
//   },
//   {$unwind: "$commissioner"}, {$unwind: "$team"}, {$unwind: "$branch"}, {$unwind: "$agency"},
//   {$match: {$and: [{"branch._id": {$in: [ObjectId("5d68c630c5e966001058cd60")]}},{"team.name": "KIÊN GIANG 1_HƠN"}]}},
  
//   {
//       $group:{
//           _id: {status:"$status", branch: "$branch._id", team: "$team._id"},
//           agency: {$first: '$agency.name' },
//           branch: {$first: '$branch.region' },
//           team : { $first: '$team.name' },
//           count: {$sum: 1}
//       }
//   },
//   { '$facet'    : {
//       metadata: [ { $count: "total" } ],
//       data: [ { $skip: 0 }, { $limit: 1 } ] // add projection here wish you re-shape the docs
//   } }
// ])
// -----------------------------------------------
