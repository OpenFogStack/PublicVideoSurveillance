import Vue from "vue";
import moment from "moment";

Vue.filter("timestamp", value => {
  if (!value) return "";
  const time = moment(value);
  return time.format("DD.MM.YYYY, HH:mm");
});

Vue.filter("formatUser", user => {
  let name = "";
  if (!user) {
    return "";
  } else if (user.nickname) {
    name = user.nickname;
  } else if (user.name) {
    name = user.name;
  } else if (user.email) {
    name = user.email;
  }
  let city = "";

  if (user.city) {
    city = user.city;
    return `${name} (${city})`;
  }
  return `${name}`;
});

Vue.prototype.$filters = Vue.options.filters;
