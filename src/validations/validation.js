//============= *validation via Regex* ================

const isValidateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const passwordVal = function (password) {
  var strongRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}$"
  );
  /*at least 1 lowercase, at least 1 uppercase,contain at least 1 numeric character,
      at least one special character, range between 8-12*/
  return strongRegex.test(password);
};
const isValidName = function (name) {
  const nameRegex = /^[a-zA-Z_ ]+$/;
  return nameRegex.test(name);
};

const isValidNo = function (number) {
  const validnumber = /^[6-9]\d{9}$/;
  return validnumber.test(number);
};
const isValidPin = function (pincode) {
  const validPin = /^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/;
  return validPin.test(pincode);
};
const isValidString = function (input) {
  if (typeof input == "number" || input == null || input == undefined) {
    return false;
  }
  if (typeof input == "string" && input.trim().length == 0) {
    return false;
  }

  return true;
};

module.exports = {
  isValidateEmail,
  passwordVal,
  isValidName,
  isValidNo,
  isValidPin,
  isValidString,
};
