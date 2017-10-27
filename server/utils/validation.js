const isRealString = str => {
  // Return if what is passed is indeed a string & not empty, and trim leading/trailing spaces
  return typeof str === 'string' && str.trim().length > 0;
};

module.exports = { isRealString };
