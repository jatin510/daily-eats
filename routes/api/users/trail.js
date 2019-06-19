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
for (var d = new Date("2019-05-26"); d <= now; d.setDate(d.getDate() + 1)) {
  daysOfYear.push(new Date(d));
  //   console.log(d);
}
let code = "de";
let random = Math.random()
  .toString(36)
  .substr(2, 4);

code += random;
code = code.toUpperCase();
console.log(code);
