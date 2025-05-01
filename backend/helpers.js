// helper functions for input validation, any implementation that's really long, etc


const exportedMethods = {
    checkId(id, varName) {
      if (!id) throw `Error: You must provide a ${varName}`;
      if (typeof id !== 'string') throw `Error:${varName} must be a string`;
      id = id.trim();
      if (id.length === 0)
        throw `Error: ${varName} cannot be an empty string or just spaces`;
      return id;
    },
    checkString(strVal, varName) {
        if (!strVal) throw `Error: You must supply a ${varName}!`;
        if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
        strVal = strVal.trim();
        if (strVal.length === 0)
          throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        if (!isNaN(strVal))
          throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
        return strVal
    },
    checkName(strVal, varName) {
        if (!strVal) throw `Error: You must supply a ${varName}!`;
        if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
        if(strVal != strVal.trim() || strVal.includes(" ")){
            throw `Error: ${varName} can't have spaces!`;
        }
        if(strVal.length < 2 || strVal.length > 20){
            throw `Error: ${varName} can't be more than 20 characters or less than 2 characters!`;
        }
        if (strVal.length === 0)
          throw `Error: ${varName} cannot be an empty string or string with just spaces`;
        if (/\d/.test(strVal))
          throw `Error: ${strVal} is not a valid value for ${varName} as it contains digits`;
        return strVal
    }
  };
  
  export default exportedMethods;