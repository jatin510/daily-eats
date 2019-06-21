// function hell() {
//   let sub = {};
//   sub.a = {};
//   sub.b = {};
//   sub.c = {};
//   sub.a.f = 2;
//   sub.b.d = 4;
//   sub.c.r = 6;
//   return sub;
// }

// a = hell();

// console.log(a);

// let date = new Date("2019-06-18").toUTCString();
// let date2 = new Date("2016-06-05").toString().split(" ")[0];
// console.log(date);
// console.log(date2);

/// kitchen ---> address
/// kitchen ---> meal type
/// kitchen ---> price
/// kitchen ---> trial meal type

///  total --->
// var now = new Date();
// var daysOfYear = [];
// let date = "2019-06-18";
// let d;
// console.log("now", now);
// for (d = new Date(date); d <= now; d.setDate(d.getDate() + 1)) {
//   // daysOfYear.push(d);
//   d.toString();

//   console.log(d.toDateString().split(" "));
//   console.log(typeof d);
// }

// let fromDate = "2019-06-25";
// let toDate = "2019-06-26";
// toDate = new Date(toDate);

// for (d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
//   let date = d.toLocaleDateString().split("/")[1];
//   let month = d.toLocaleDateString().split("/")[0];
//   let year = d.toLocaleDateString().split("/")[2];
//   let day = d.toDateString().split(" ")[0];
//   console.log(date);
//   console.log(month);
//   console.log(year);
//   console.log(d.getDate());
//   console.log(d.getMonth());
//   console.log(d.getFullYear());
//   // console.log(d.)
// }

a = { b: true, c: false };

if (a.b) console.log("b");
if (a.c) console.log("c");
