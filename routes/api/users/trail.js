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

let date = new Date("2019-06-18").toUTCString();
let date2 = new Date("2016-06-05").toString().split(" ")[0];
console.log(date);
console.log(date2);

/// kitchen ---> address
/// kitchen ---> meal type
/// kitchen ---> price
/// kitchen ---> trial meal type

///  total --->
var now = new Date();
var daysOfYear = [];
for (var d = new Date("2019-06-18"); d <= now; d.setDate(d.getDate() + 1)) {
  // daysOfYear.push(d);
  d.toString();

  console.log(d.toDateString().split(" "));
  console.log(typeof d);
}
