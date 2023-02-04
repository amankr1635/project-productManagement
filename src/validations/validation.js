//============= *validation via Regex* ================

const isValidEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};
const passwordVal = function (password) {
  var strongRegex = new RegExp(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,15}$/
  );
  /*at least 1 lowercase, at least 1 uppercase,contain at least 1 numeric character,
      at least one special character, range between 8-15*/
  return strongRegex.test(password);
};

const isValidImage = function (name) {
  const linkRegex =/(.png|.jpg|.jpeg)$/i;
  return linkRegex.test(name);
};

const isValidName = function (name) {
  const nameRegex = /^[a-z A-Z_]{3,20}$/;
  return nameRegex.test(name);
};

const isValidTitle = function (name) {
  const nameRegex = /^[a-z A-Z_0-9]{3,20}$/;
  return nameRegex.test(name);
};

const isValidDecimal = function(number){
  const regexp = /^\d+(\.\d{1,2})?$/
  return regexp.test(number);
}

const isValidNo = function (number) {
  const validnumber = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/
  // /^[6-9]\d{9}$/;
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
  isValidEmail,
  passwordVal,
  isValidName,
  isValidTitle,
  isValidNo,
  isValidDecimal,
  isValidPin,
  isValidString,
  isValidImage
};
