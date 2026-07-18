"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb2, mod) => function __require() {
    return mod || (0, cb2[__getOwnPropNames(cb2)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // node_modules/fast-xml-parser/src/util.js
  var require_util = __commonJS({
    "node_modules/fast-xml-parser/src/util.js"(exports) {
      "use strict";
      var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
      var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
      var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
      var regexName = new RegExp("^" + nameRegexp + "$");
      var getAllMatches = function(string, regex) {
        const matches = [];
        let match2 = regex.exec(string);
        while (match2) {
          const allmatches = [];
          allmatches.startIndex = regex.lastIndex - match2[0].length;
          const len = match2.length;
          for (let index = 0; index < len; index++) {
            allmatches.push(match2[index]);
          }
          matches.push(allmatches);
          match2 = regex.exec(string);
        }
        return matches;
      };
      var isName = function(string) {
        const match2 = regexName.exec(string);
        return !(match2 === null || typeof match2 === "undefined");
      };
      exports.isExist = function(v2) {
        return typeof v2 !== "undefined";
      };
      exports.isEmptyObject = function(obj) {
        return Object.keys(obj).length === 0;
      };
      exports.merge = function(target, a2, arrayMode) {
        if (a2) {
          const keys = Object.keys(a2);
          const len = keys.length;
          for (let i2 = 0; i2 < len; i2++) {
            if (arrayMode === "strict") {
              target[keys[i2]] = [a2[keys[i2]]];
            } else {
              target[keys[i2]] = a2[keys[i2]];
            }
          }
        }
      };
      exports.getValue = function(v2) {
        if (exports.isExist(v2)) {
          return v2;
        } else {
          return "";
        }
      };
      exports.isName = isName;
      exports.getAllMatches = getAllMatches;
      exports.nameRegexp = nameRegexp;
    }
  });

  // node_modules/fast-xml-parser/src/validator.js
  var require_validator = __commonJS({
    "node_modules/fast-xml-parser/src/validator.js"(exports) {
      "use strict";
      var util = require_util();
      var defaultOptions = {
        allowBooleanAttributes: false,
        //A tag can have attributes without any value
        unpairedTags: []
      };
      exports.validate = function(xmlData, options) {
        options = Object.assign({}, defaultOptions, options);
        const tags = [];
        let tagFound = false;
        let reachedRoot = false;
        if (xmlData[0] === "\uFEFF") {
          xmlData = xmlData.substr(1);
        }
        for (let i2 = 0; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "<" && xmlData[i2 + 1] === "?") {
            i2 += 2;
            i2 = readPI(xmlData, i2);
            if (i2.err)
              return i2;
          } else if (xmlData[i2] === "<") {
            let tagStartPos = i2;
            i2++;
            if (xmlData[i2] === "!") {
              i2 = readCommentAndCDATA(xmlData, i2);
              continue;
            } else {
              let closingTag = false;
              if (xmlData[i2] === "/") {
                closingTag = true;
                i2++;
              }
              let tagName = "";
              for (; i2 < xmlData.length && xmlData[i2] !== ">" && xmlData[i2] !== " " && xmlData[i2] !== "	" && xmlData[i2] !== "\n" && xmlData[i2] !== "\r"; i2++) {
                tagName += xmlData[i2];
              }
              tagName = tagName.trim();
              if (tagName[tagName.length - 1] === "/") {
                tagName = tagName.substring(0, tagName.length - 1);
                i2--;
              }
              if (!validateTagName(tagName)) {
                let msg;
                if (tagName.trim().length === 0) {
                  msg = "Invalid space after '<'.";
                } else {
                  msg = "Tag '" + tagName + "' is an invalid name.";
                }
                return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i2));
              }
              const result = readAttributeStr(xmlData, i2);
              if (result === false) {
                return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i2));
              }
              let attrStr = result.value;
              i2 = result.index;
              if (attrStr[attrStr.length - 1] === "/") {
                const attrStrStart = i2 - attrStr.length;
                attrStr = attrStr.substring(0, attrStr.length - 1);
                const isValid = validateAttributeString(attrStr, options);
                if (isValid === true) {
                  tagFound = true;
                } else {
                  return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
                }
              } else if (closingTag) {
                if (!result.tagClosed) {
                  return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i2));
                } else if (attrStr.trim().length > 0) {
                  return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
                } else if (tags.length === 0) {
                  return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
                } else {
                  const otg = tags.pop();
                  if (tagName !== otg.tagName) {
                    let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
                    return getErrorObject(
                      "InvalidTag",
                      "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                      getLineNumberForPosition(xmlData, tagStartPos)
                    );
                  }
                  if (tags.length == 0) {
                    reachedRoot = true;
                  }
                }
              } else {
                const isValid = validateAttributeString(attrStr, options);
                if (isValid !== true) {
                  return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i2 - attrStr.length + isValid.err.line));
                }
                if (reachedRoot === true) {
                  return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i2));
                } else if (options.unpairedTags.indexOf(tagName) !== -1) {
                } else {
                  tags.push({ tagName, tagStartPos });
                }
                tagFound = true;
              }
              for (i2++; i2 < xmlData.length; i2++) {
                if (xmlData[i2] === "<") {
                  if (xmlData[i2 + 1] === "!") {
                    i2++;
                    i2 = readCommentAndCDATA(xmlData, i2);
                    continue;
                  } else if (xmlData[i2 + 1] === "?") {
                    i2 = readPI(xmlData, ++i2);
                    if (i2.err)
                      return i2;
                  } else {
                    break;
                  }
                } else if (xmlData[i2] === "&") {
                  const afterAmp = validateAmpersand(xmlData, i2);
                  if (afterAmp == -1)
                    return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i2));
                  i2 = afterAmp;
                } else {
                  if (reachedRoot === true && !isWhiteSpace(xmlData[i2])) {
                    return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i2));
                  }
                }
              }
              if (xmlData[i2] === "<") {
                i2--;
              }
            }
          } else {
            if (isWhiteSpace(xmlData[i2])) {
              continue;
            }
            return getErrorObject("InvalidChar", "char '" + xmlData[i2] + "' is not expected.", getLineNumberForPosition(xmlData, i2));
          }
        }
        if (!tagFound) {
          return getErrorObject("InvalidXml", "Start tag expected.", 1);
        } else if (tags.length == 1) {
          return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
        } else if (tags.length > 0) {
          return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t2) => t2.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
        }
        return true;
      };
      function isWhiteSpace(char) {
        return char === " " || char === "	" || char === "\n" || char === "\r";
      }
      function readPI(xmlData, i2) {
        const start = i2;
        for (; i2 < xmlData.length; i2++) {
          if (xmlData[i2] == "?" || xmlData[i2] == " ") {
            const tagname = xmlData.substr(start, i2 - start);
            if (i2 > 5 && tagname === "xml") {
              return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i2));
            } else if (xmlData[i2] == "?" && xmlData[i2 + 1] == ">") {
              i2++;
              break;
            } else {
              continue;
            }
          }
        }
        return i2;
      }
      function readCommentAndCDATA(xmlData, i2) {
        if (xmlData.length > i2 + 5 && xmlData[i2 + 1] === "-" && xmlData[i2 + 2] === "-") {
          for (i2 += 3; i2 < xmlData.length; i2++) {
            if (xmlData[i2] === "-" && xmlData[i2 + 1] === "-" && xmlData[i2 + 2] === ">") {
              i2 += 2;
              break;
            }
          }
        } else if (xmlData.length > i2 + 8 && xmlData[i2 + 1] === "D" && xmlData[i2 + 2] === "O" && xmlData[i2 + 3] === "C" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "Y" && xmlData[i2 + 6] === "P" && xmlData[i2 + 7] === "E") {
          let angleBracketsCount = 1;
          for (i2 += 8; i2 < xmlData.length; i2++) {
            if (xmlData[i2] === "<") {
              angleBracketsCount++;
            } else if (xmlData[i2] === ">") {
              angleBracketsCount--;
              if (angleBracketsCount === 0) {
                break;
              }
            }
          }
        } else if (xmlData.length > i2 + 9 && xmlData[i2 + 1] === "[" && xmlData[i2 + 2] === "C" && xmlData[i2 + 3] === "D" && xmlData[i2 + 4] === "A" && xmlData[i2 + 5] === "T" && xmlData[i2 + 6] === "A" && xmlData[i2 + 7] === "[") {
          for (i2 += 8; i2 < xmlData.length; i2++) {
            if (xmlData[i2] === "]" && xmlData[i2 + 1] === "]" && xmlData[i2 + 2] === ">") {
              i2 += 2;
              break;
            }
          }
        }
        return i2;
      }
      var doubleQuote = '"';
      var singleQuote = "'";
      function readAttributeStr(xmlData, i2) {
        let attrStr = "";
        let startChar = "";
        let tagClosed = false;
        for (; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === doubleQuote || xmlData[i2] === singleQuote) {
            if (startChar === "") {
              startChar = xmlData[i2];
            } else if (startChar !== xmlData[i2]) {
            } else {
              startChar = "";
            }
          } else if (xmlData[i2] === ">") {
            if (startChar === "") {
              tagClosed = true;
              break;
            }
          }
          attrStr += xmlData[i2];
        }
        if (startChar !== "") {
          return false;
        }
        return {
          value: attrStr,
          index: i2,
          tagClosed
        };
      }
      var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
      function validateAttributeString(attrStr, options) {
        const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
        const attrNames = {};
        for (let i2 = 0; i2 < matches.length; i2++) {
          if (matches[i2][1].length === 0) {
            return getErrorObject("InvalidAttr", "Attribute '" + matches[i2][2] + "' has no space in starting.", getPositionFromMatch(matches[i2]));
          } else if (matches[i2][3] !== void 0 && matches[i2][4] === void 0) {
            return getErrorObject("InvalidAttr", "Attribute '" + matches[i2][2] + "' is without value.", getPositionFromMatch(matches[i2]));
          } else if (matches[i2][3] === void 0 && !options.allowBooleanAttributes) {
            return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i2][2] + "' is not allowed.", getPositionFromMatch(matches[i2]));
          }
          const attrName = matches[i2][2];
          if (!validateAttrName(attrName)) {
            return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i2]));
          }
          if (!attrNames.hasOwnProperty(attrName)) {
            attrNames[attrName] = 1;
          } else {
            return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i2]));
          }
        }
        return true;
      }
      function validateNumberAmpersand(xmlData, i2) {
        let re = /\d/;
        if (xmlData[i2] === "x") {
          i2++;
          re = /[\da-fA-F]/;
        }
        for (; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === ";")
            return i2;
          if (!xmlData[i2].match(re))
            break;
        }
        return -1;
      }
      function validateAmpersand(xmlData, i2) {
        i2++;
        if (xmlData[i2] === ";")
          return -1;
        if (xmlData[i2] === "#") {
          i2++;
          return validateNumberAmpersand(xmlData, i2);
        }
        let count = 0;
        for (; i2 < xmlData.length; i2++, count++) {
          if (xmlData[i2].match(/\w/) && count < 20)
            continue;
          if (xmlData[i2] === ";")
            break;
          return -1;
        }
        return i2;
      }
      function getErrorObject(code, message, lineNumber) {
        return {
          err: {
            code,
            msg: message,
            line: lineNumber.line || lineNumber,
            col: lineNumber.col
          }
        };
      }
      function validateAttrName(attrName) {
        return util.isName(attrName);
      }
      function validateTagName(tagname) {
        return util.isName(tagname);
      }
      function getLineNumberForPosition(xmlData, index) {
        const lines = xmlData.substring(0, index).split(/\r?\n/);
        return {
          line: lines.length,
          // column number is last line's length + 1, because column numbering starts at 1:
          col: lines[lines.length - 1].length + 1
        };
      }
      function getPositionFromMatch(match2) {
        return match2.startIndex + match2[1].length;
      }
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
  var require_OptionsBuilder = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js"(exports) {
      var defaultOptions = {
        preserveOrder: false,
        attributeNamePrefix: "@_",
        attributesGroupName: false,
        textNodeName: "#text",
        ignoreAttributes: true,
        removeNSPrefix: false,
        // remove NS from tag name or attribute name if true
        allowBooleanAttributes: false,
        //a tag can have attributes without any value
        //ignoreRootElement : false,
        parseTagValue: true,
        parseAttributeValue: false,
        trimValues: true,
        //Trim string values of tag and attributes
        cdataPropName: false,
        numberParseOptions: {
          hex: true,
          leadingZeros: true,
          eNotation: true
        },
        tagValueProcessor: function(tagName, val2) {
          return val2;
        },
        attributeValueProcessor: function(attrName, val2) {
          return val2;
        },
        stopNodes: [],
        //nested tags will not be parsed even for errors
        alwaysCreateTextNode: false,
        isArray: () => false,
        commentPropName: false,
        unpairedTags: [],
        processEntities: true,
        htmlEntities: false,
        ignoreDeclaration: false,
        ignorePiTags: false,
        transformTagName: false,
        transformAttributeName: false,
        updateTag: function(tagName, jPath, attrs) {
          return tagName;
        }
        // skipEmptyListItem: false
      };
      var buildOptions = function(options) {
        return Object.assign({}, defaultOptions, options);
      };
      exports.buildOptions = buildOptions;
      exports.defaultOptions = defaultOptions;
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
  var require_xmlNode = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/xmlNode.js"(exports, module) {
      "use strict";
      var XmlNode2 = class {
        constructor(tagname) {
          this.tagname = tagname;
          this.child = [];
          this[":@"] = {};
        }
        add(key, val2) {
          if (key === "__proto__")
            key = "#__proto__";
          this.child.push({ [key]: val2 });
        }
        addChild(node) {
          if (node.tagname === "__proto__")
            node.tagname = "#__proto__";
          if (node[":@"] && Object.keys(node[":@"]).length > 0) {
            this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
          } else {
            this.child.push({ [node.tagname]: node.child });
          }
        }
      };
      module.exports = XmlNode2;
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
  var require_DocTypeReader = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js"(exports, module) {
      var util = require_util();
      function readDocType(xmlData, i2) {
        const entities = {};
        if (xmlData[i2 + 3] === "O" && xmlData[i2 + 4] === "C" && xmlData[i2 + 5] === "T" && xmlData[i2 + 6] === "Y" && xmlData[i2 + 7] === "P" && xmlData[i2 + 8] === "E") {
          i2 = i2 + 9;
          let angleBracketsCount = 1;
          let hasBody = false, comment = false;
          let exp = "";
          for (; i2 < xmlData.length; i2++) {
            if (xmlData[i2] === "<" && !comment) {
              if (hasBody && isEntity(xmlData, i2)) {
                i2 += 7;
                [entityName, val, i2] = readEntityExp(xmlData, i2 + 1);
                if (val.indexOf("&") === -1)
                  entities[validateEntityName(entityName)] = {
                    regx: RegExp(`&${entityName};`, "g"),
                    val
                  };
              } else if (hasBody && isElement(xmlData, i2))
                i2 += 8;
              else if (hasBody && isAttlist(xmlData, i2))
                i2 += 8;
              else if (hasBody && isNotation(xmlData, i2))
                i2 += 9;
              else if (isComment)
                comment = true;
              else
                throw new Error("Invalid DOCTYPE");
              angleBracketsCount++;
              exp = "";
            } else if (xmlData[i2] === ">") {
              if (comment) {
                if (xmlData[i2 - 1] === "-" && xmlData[i2 - 2] === "-") {
                  comment = false;
                  angleBracketsCount--;
                }
              } else {
                angleBracketsCount--;
              }
              if (angleBracketsCount === 0) {
                break;
              }
            } else if (xmlData[i2] === "[") {
              hasBody = true;
            } else {
              exp += xmlData[i2];
            }
          }
          if (angleBracketsCount !== 0) {
            throw new Error(`Unclosed DOCTYPE`);
          }
        } else {
          throw new Error(`Invalid Tag instead of DOCTYPE`);
        }
        return { entities, i: i2 };
      }
      function readEntityExp(xmlData, i2) {
        let entityName2 = "";
        for (; i2 < xmlData.length && (xmlData[i2] !== "'" && xmlData[i2] !== '"'); i2++) {
          entityName2 += xmlData[i2];
        }
        entityName2 = entityName2.trim();
        if (entityName2.indexOf(" ") !== -1)
          throw new Error("External entites are not supported");
        const startChar = xmlData[i2++];
        let val2 = "";
        for (; i2 < xmlData.length && xmlData[i2] !== startChar; i2++) {
          val2 += xmlData[i2];
        }
        return [entityName2, val2, i2];
      }
      function isComment(xmlData, i2) {
        if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "-" && xmlData[i2 + 3] === "-")
          return true;
        return false;
      }
      function isEntity(xmlData, i2) {
        if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "E" && xmlData[i2 + 3] === "N" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "I" && xmlData[i2 + 6] === "T" && xmlData[i2 + 7] === "Y")
          return true;
        return false;
      }
      function isElement(xmlData, i2) {
        if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "E" && xmlData[i2 + 3] === "L" && xmlData[i2 + 4] === "E" && xmlData[i2 + 5] === "M" && xmlData[i2 + 6] === "E" && xmlData[i2 + 7] === "N" && xmlData[i2 + 8] === "T")
          return true;
        return false;
      }
      function isAttlist(xmlData, i2) {
        if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "A" && xmlData[i2 + 3] === "T" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "L" && xmlData[i2 + 6] === "I" && xmlData[i2 + 7] === "S" && xmlData[i2 + 8] === "T")
          return true;
        return false;
      }
      function isNotation(xmlData, i2) {
        if (xmlData[i2 + 1] === "!" && xmlData[i2 + 2] === "N" && xmlData[i2 + 3] === "O" && xmlData[i2 + 4] === "T" && xmlData[i2 + 5] === "A" && xmlData[i2 + 6] === "T" && xmlData[i2 + 7] === "I" && xmlData[i2 + 8] === "O" && xmlData[i2 + 9] === "N")
          return true;
        return false;
      }
      function validateEntityName(name) {
        if (util.isName(name))
          return name;
        else
          throw new Error(`Invalid entity name ${name}`);
      }
      module.exports = readDocType;
    }
  });

  // node_modules/strnum/strnum.js
  var require_strnum = __commonJS({
    "node_modules/strnum/strnum.js"(exports, module) {
      var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
      var numRegex = /^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;
      if (!Number.parseInt && window.parseInt) {
        Number.parseInt = window.parseInt;
      }
      if (!Number.parseFloat && window.parseFloat) {
        Number.parseFloat = window.parseFloat;
      }
      var consider = {
        hex: true,
        leadingZeros: true,
        decimalPoint: ".",
        eNotation: true
        //skipLike: /regex/
      };
      function toNumber(str2, options = {}) {
        options = Object.assign({}, consider, options);
        if (!str2 || typeof str2 !== "string")
          return str2;
        let trimmedStr = str2.trim();
        if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr))
          return str2;
        else if (options.hex && hexRegex.test(trimmedStr)) {
          return Number.parseInt(trimmedStr, 16);
        } else {
          const match2 = numRegex.exec(trimmedStr);
          if (match2) {
            const sign = match2[1];
            const leadingZeros = match2[2];
            let numTrimmedByZeros = trimZeros(match2[3]);
            const eNotation = match2[4] || match2[6];
            if (!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".")
              return str2;
            else if (!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".")
              return str2;
            else {
              const num = Number(trimmedStr);
              const numStr = "" + num;
              if (numStr.search(/[eE]/) !== -1) {
                if (options.eNotation)
                  return num;
                else
                  return str2;
              } else if (eNotation) {
                if (options.eNotation)
                  return num;
                else
                  return str2;
              } else if (trimmedStr.indexOf(".") !== -1) {
                if (numStr === "0" && numTrimmedByZeros === "")
                  return num;
                else if (numStr === numTrimmedByZeros)
                  return num;
                else if (sign && numStr === "-" + numTrimmedByZeros)
                  return num;
                else
                  return str2;
              }
              if (leadingZeros) {
                if (numTrimmedByZeros === numStr)
                  return num;
                else if (sign + numTrimmedByZeros === numStr)
                  return num;
                else
                  return str2;
              }
              if (trimmedStr === numStr)
                return num;
              else if (trimmedStr === sign + numStr)
                return num;
              return str2;
            }
          } else {
            return str2;
          }
        }
      }
      function trimZeros(numStr) {
        if (numStr && numStr.indexOf(".") !== -1) {
          numStr = numStr.replace(/0+$/, "");
          if (numStr === ".")
            numStr = "0";
          else if (numStr[0] === ".")
            numStr = "0" + numStr;
          else if (numStr[numStr.length - 1] === ".")
            numStr = numStr.substr(0, numStr.length - 1);
          return numStr;
        }
        return numStr;
      }
      module.exports = toNumber;
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
  var require_OrderedObjParser = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js"(exports, module) {
      "use strict";
      var util = require_util();
      var xmlNode = require_xmlNode();
      var readDocType = require_DocTypeReader();
      var toNumber = require_strnum();
      var OrderedObjParser = class {
        constructor(options) {
          this.options = options;
          this.currentNode = null;
          this.tagsNodeStack = [];
          this.docTypeEntities = {};
          this.lastEntities = {
            "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
            "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
            "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
            "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
          };
          this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
          this.htmlEntities = {
            "space": { regex: /&(nbsp|#160);/g, val: " " },
            // "lt" : { regex: /&(lt|#60);/g, val: "<" },
            // "gt" : { regex: /&(gt|#62);/g, val: ">" },
            // "amp" : { regex: /&(amp|#38);/g, val: "&" },
            // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
            // "apos" : { regex: /&(apos|#39);/g, val: "'" },
            "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
            "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
            "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
            "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
            "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
            "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
            "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
            "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str2) => String.fromCharCode(Number.parseInt(str2, 10)) },
            "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str2) => String.fromCharCode(Number.parseInt(str2, 16)) }
          };
          this.addExternalEntities = addExternalEntities;
          this.parseXml = parseXml;
          this.parseTextData = parseTextData;
          this.resolveNameSpace = resolveNameSpace;
          this.buildAttributesMap = buildAttributesMap;
          this.isItStopNode = isItStopNode;
          this.replaceEntitiesValue = replaceEntitiesValue;
          this.readStopNodeData = readStopNodeData;
          this.saveTextToParentTag = saveTextToParentTag;
          this.addChild = addChild;
        }
      };
      function addExternalEntities(externalEntities) {
        const entKeys = Object.keys(externalEntities);
        for (let i2 = 0; i2 < entKeys.length; i2++) {
          const ent = entKeys[i2];
          this.lastEntities[ent] = {
            regex: new RegExp("&" + ent + ";", "g"),
            val: externalEntities[ent]
          };
        }
      }
      function parseTextData(val2, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
        if (val2 !== void 0) {
          if (this.options.trimValues && !dontTrim) {
            val2 = val2.trim();
          }
          if (val2.length > 0) {
            if (!escapeEntities)
              val2 = this.replaceEntitiesValue(val2);
            const newval = this.options.tagValueProcessor(tagName, val2, jPath, hasAttributes, isLeafNode);
            if (newval === null || newval === void 0) {
              return val2;
            } else if (typeof newval !== typeof val2 || newval !== val2) {
              return newval;
            } else if (this.options.trimValues) {
              return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
            } else {
              const trimmedVal = val2.trim();
              if (trimmedVal === val2) {
                return parseValue(val2, this.options.parseTagValue, this.options.numberParseOptions);
              } else {
                return val2;
              }
            }
          }
        }
      }
      function resolveNameSpace(tagname) {
        if (this.options.removeNSPrefix) {
          const tags = tagname.split(":");
          const prefix = tagname.charAt(0) === "/" ? "/" : "";
          if (tags[0] === "xmlns") {
            return "";
          }
          if (tags.length === 2) {
            tagname = prefix + tags[1];
          }
        }
        return tagname;
      }
      var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
      function buildAttributesMap(attrStr, jPath, tagName) {
        if (!this.options.ignoreAttributes && typeof attrStr === "string") {
          const matches = util.getAllMatches(attrStr, attrsRegx);
          const len = matches.length;
          const attrs = {};
          for (let i2 = 0; i2 < len; i2++) {
            const attrName = this.resolveNameSpace(matches[i2][1]);
            let oldVal = matches[i2][4];
            let aName = this.options.attributeNamePrefix + attrName;
            if (attrName.length) {
              if (this.options.transformAttributeName) {
                aName = this.options.transformAttributeName(aName);
              }
              if (aName === "__proto__")
                aName = "#__proto__";
              if (oldVal !== void 0) {
                if (this.options.trimValues) {
                  oldVal = oldVal.trim();
                }
                oldVal = this.replaceEntitiesValue(oldVal);
                const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
                if (newVal === null || newVal === void 0) {
                  attrs[aName] = oldVal;
                } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
                  attrs[aName] = newVal;
                } else {
                  attrs[aName] = parseValue(
                    oldVal,
                    this.options.parseAttributeValue,
                    this.options.numberParseOptions
                  );
                }
              } else if (this.options.allowBooleanAttributes) {
                attrs[aName] = true;
              }
            }
          }
          if (!Object.keys(attrs).length) {
            return;
          }
          if (this.options.attributesGroupName) {
            const attrCollection = {};
            attrCollection[this.options.attributesGroupName] = attrs;
            return attrCollection;
          }
          return attrs;
        }
      }
      var parseXml = function(xmlData) {
        xmlData = xmlData.replace(/\r\n?/g, "\n");
        const xmlObj = new xmlNode("!xml");
        let currentNode = xmlObj;
        let textData = "";
        let jPath = "";
        for (let i2 = 0; i2 < xmlData.length; i2++) {
          const ch2 = xmlData[i2];
          if (ch2 === "<") {
            if (xmlData[i2 + 1] === "/") {
              const closeIndex = findClosingIndex(xmlData, ">", i2, "Closing Tag is not closed.");
              let tagName = xmlData.substring(i2 + 2, closeIndex).trim();
              if (this.options.removeNSPrefix) {
                const colonIndex = tagName.indexOf(":");
                if (colonIndex !== -1) {
                  tagName = tagName.substr(colonIndex + 1);
                }
              }
              if (this.options.transformTagName) {
                tagName = this.options.transformTagName(tagName);
              }
              if (currentNode) {
                textData = this.saveTextToParentTag(textData, currentNode, jPath);
              }
              const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
              if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
                throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
              }
              let propIndex = 0;
              if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
                propIndex = jPath.lastIndexOf(".", jPath.lastIndexOf(".") - 1);
                this.tagsNodeStack.pop();
              } else {
                propIndex = jPath.lastIndexOf(".");
              }
              jPath = jPath.substring(0, propIndex);
              currentNode = this.tagsNodeStack.pop();
              textData = "";
              i2 = closeIndex;
            } else if (xmlData[i2 + 1] === "?") {
              let tagData = readTagExp(xmlData, i2, false, "?>");
              if (!tagData)
                throw new Error("Pi Tag is not closed.");
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              if (this.options.ignoreDeclaration && tagData.tagName === "?xml" || this.options.ignorePiTags) {
              } else {
                const childNode = new xmlNode(tagData.tagName);
                childNode.add(this.options.textNodeName, "");
                if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
                }
                this.addChild(currentNode, childNode, jPath);
              }
              i2 = tagData.closeIndex + 1;
            } else if (xmlData.substr(i2 + 1, 3) === "!--") {
              const endIndex = findClosingIndex(xmlData, "-->", i2 + 4, "Comment is not closed.");
              if (this.options.commentPropName) {
                const comment = xmlData.substring(i2 + 4, endIndex - 2);
                textData = this.saveTextToParentTag(textData, currentNode, jPath);
                currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
              }
              i2 = endIndex;
            } else if (xmlData.substr(i2 + 1, 2) === "!D") {
              const result = readDocType(xmlData, i2);
              this.docTypeEntities = result.entities;
              i2 = result.i;
            } else if (xmlData.substr(i2 + 1, 2) === "![") {
              const closeIndex = findClosingIndex(xmlData, "]]>", i2, "CDATA is not closed.") - 2;
              const tagExp = xmlData.substring(i2 + 9, closeIndex);
              textData = this.saveTextToParentTag(textData, currentNode, jPath);
              let val2 = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
              if (val2 == void 0)
                val2 = "";
              if (this.options.cdataPropName) {
                currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
              } else {
                currentNode.add(this.options.textNodeName, val2);
              }
              i2 = closeIndex + 2;
            } else {
              let result = readTagExp(xmlData, i2, this.options.removeNSPrefix);
              let tagName = result.tagName;
              const rawTagName = result.rawTagName;
              let tagExp = result.tagExp;
              let attrExpPresent = result.attrExpPresent;
              let closeIndex = result.closeIndex;
              if (this.options.transformTagName) {
                tagName = this.options.transformTagName(tagName);
              }
              if (currentNode && textData) {
                if (currentNode.tagname !== "!xml") {
                  textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
                }
              }
              const lastTag = currentNode;
              if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
                currentNode = this.tagsNodeStack.pop();
                jPath = jPath.substring(0, jPath.lastIndexOf("."));
              }
              if (tagName !== xmlObj.tagname) {
                jPath += jPath ? "." + tagName : tagName;
              }
              if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
                let tagContent = "";
                if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                  if (tagName[tagName.length - 1] === "/") {
                    tagName = tagName.substr(0, tagName.length - 1);
                    jPath = jPath.substr(0, jPath.length - 1);
                    tagExp = tagName;
                  } else {
                    tagExp = tagExp.substr(0, tagExp.length - 1);
                  }
                  i2 = result.closeIndex;
                } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                  i2 = result.closeIndex;
                } else {
                  const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
                  if (!result2)
                    throw new Error(`Unexpected end of ${rawTagName}`);
                  i2 = result2.i;
                  tagContent = result2.tagContent;
                }
                const childNode = new xmlNode(tagName);
                if (tagName !== tagExp && attrExpPresent) {
                  childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                }
                if (tagContent) {
                  tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
                }
                jPath = jPath.substr(0, jPath.lastIndexOf("."));
                childNode.add(this.options.textNodeName, tagContent);
                this.addChild(currentNode, childNode, jPath);
              } else {
                if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
                  if (tagName[tagName.length - 1] === "/") {
                    tagName = tagName.substr(0, tagName.length - 1);
                    jPath = jPath.substr(0, jPath.length - 1);
                    tagExp = tagName;
                  } else {
                    tagExp = tagExp.substr(0, tagExp.length - 1);
                  }
                  if (this.options.transformTagName) {
                    tagName = this.options.transformTagName(tagName);
                  }
                  const childNode = new xmlNode(tagName);
                  if (tagName !== tagExp && attrExpPresent) {
                    childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                  }
                  this.addChild(currentNode, childNode, jPath);
                  jPath = jPath.substr(0, jPath.lastIndexOf("."));
                } else {
                  const childNode = new xmlNode(tagName);
                  this.tagsNodeStack.push(currentNode);
                  if (tagName !== tagExp && attrExpPresent) {
                    childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
                  }
                  this.addChild(currentNode, childNode, jPath);
                  currentNode = childNode;
                }
                textData = "";
                i2 = closeIndex;
              }
            }
          } else {
            textData += xmlData[i2];
          }
        }
        return xmlObj.child;
      };
      function addChild(currentNode, childNode, jPath) {
        const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"]);
        if (result === false) {
        } else if (typeof result === "string") {
          childNode.tagname = result;
          currentNode.addChild(childNode);
        } else {
          currentNode.addChild(childNode);
        }
      }
      var replaceEntitiesValue = function(val2) {
        if (this.options.processEntities) {
          for (let entityName2 in this.docTypeEntities) {
            const entity = this.docTypeEntities[entityName2];
            val2 = val2.replace(entity.regx, entity.val);
          }
          for (let entityName2 in this.lastEntities) {
            const entity = this.lastEntities[entityName2];
            val2 = val2.replace(entity.regex, entity.val);
          }
          if (this.options.htmlEntities) {
            for (let entityName2 in this.htmlEntities) {
              const entity = this.htmlEntities[entityName2];
              val2 = val2.replace(entity.regex, entity.val);
            }
          }
          val2 = val2.replace(this.ampEntity.regex, this.ampEntity.val);
        }
        return val2;
      };
      function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
        if (textData) {
          if (isLeafNode === void 0)
            isLeafNode = Object.keys(currentNode.child).length === 0;
          textData = this.parseTextData(
            textData,
            currentNode.tagname,
            jPath,
            false,
            currentNode[":@"] ? Object.keys(currentNode[":@"]).length !== 0 : false,
            isLeafNode
          );
          if (textData !== void 0 && textData !== "")
            currentNode.add(this.options.textNodeName, textData);
          textData = "";
        }
        return textData;
      }
      function isItStopNode(stopNodes, jPath, currentTagName) {
        const allNodesExp = "*." + currentTagName;
        for (const stopNodePath in stopNodes) {
          const stopNodeExp = stopNodes[stopNodePath];
          if (allNodesExp === stopNodeExp || jPath === stopNodeExp)
            return true;
        }
        return false;
      }
      function tagExpWithClosingIndex(xmlData, i2, closingChar = ">") {
        let attrBoundary;
        let tagExp = "";
        for (let index = i2; index < xmlData.length; index++) {
          let ch2 = xmlData[index];
          if (attrBoundary) {
            if (ch2 === attrBoundary)
              attrBoundary = "";
          } else if (ch2 === '"' || ch2 === "'") {
            attrBoundary = ch2;
          } else if (ch2 === closingChar[0]) {
            if (closingChar[1]) {
              if (xmlData[index + 1] === closingChar[1]) {
                return {
                  data: tagExp,
                  index
                };
              }
            } else {
              return {
                data: tagExp,
                index
              };
            }
          } else if (ch2 === "	") {
            ch2 = " ";
          }
          tagExp += ch2;
        }
      }
      function findClosingIndex(xmlData, str2, i2, errMsg) {
        const closingIndex = xmlData.indexOf(str2, i2);
        if (closingIndex === -1) {
          throw new Error(errMsg);
        } else {
          return closingIndex + str2.length - 1;
        }
      }
      function readTagExp(xmlData, i2, removeNSPrefix, closingChar = ">") {
        const result = tagExpWithClosingIndex(xmlData, i2 + 1, closingChar);
        if (!result)
          return;
        let tagExp = result.data;
        const closeIndex = result.index;
        const separatorIndex = tagExp.search(/\s/);
        let tagName = tagExp;
        let attrExpPresent = true;
        if (separatorIndex !== -1) {
          tagName = tagExp.substring(0, separatorIndex);
          tagExp = tagExp.substring(separatorIndex + 1).trimStart();
        }
        const rawTagName = tagName;
        if (removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
            attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
          }
        }
        return {
          tagName,
          tagExp,
          closeIndex,
          attrExpPresent,
          rawTagName
        };
      }
      function readStopNodeData(xmlData, tagName, i2) {
        const startIndex = i2;
        let openTagCount = 1;
        for (; i2 < xmlData.length; i2++) {
          if (xmlData[i2] === "<") {
            if (xmlData[i2 + 1] === "/") {
              const closeIndex = findClosingIndex(xmlData, ">", i2, `${tagName} is not closed`);
              let closeTagName = xmlData.substring(i2 + 2, closeIndex).trim();
              if (closeTagName === tagName) {
                openTagCount--;
                if (openTagCount === 0) {
                  return {
                    tagContent: xmlData.substring(startIndex, i2),
                    i: closeIndex
                  };
                }
              }
              i2 = closeIndex;
            } else if (xmlData[i2 + 1] === "?") {
              const closeIndex = findClosingIndex(xmlData, "?>", i2 + 1, "StopNode is not closed.");
              i2 = closeIndex;
            } else if (xmlData.substr(i2 + 1, 3) === "!--") {
              const closeIndex = findClosingIndex(xmlData, "-->", i2 + 3, "StopNode is not closed.");
              i2 = closeIndex;
            } else if (xmlData.substr(i2 + 1, 2) === "![") {
              const closeIndex = findClosingIndex(xmlData, "]]>", i2, "StopNode is not closed.") - 2;
              i2 = closeIndex;
            } else {
              const tagData = readTagExp(xmlData, i2, ">");
              if (tagData) {
                const openTagName = tagData && tagData.tagName;
                if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
                  openTagCount++;
                }
                i2 = tagData.closeIndex;
              }
            }
          }
        }
      }
      function parseValue(val2, shouldParse, options) {
        if (shouldParse && typeof val2 === "string") {
          const newval = val2.trim();
          if (newval === "true")
            return true;
          else if (newval === "false")
            return false;
          else
            return toNumber(val2, options);
        } else {
          if (util.isExist(val2)) {
            return val2;
          } else {
            return "";
          }
        }
      }
      module.exports = OrderedObjParser;
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/node2json.js
  var require_node2json = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/node2json.js"(exports) {
      "use strict";
      function prettify(node, options) {
        return compress(node, options);
      }
      function compress(arr, options, jPath) {
        let text;
        const compressedObj = {};
        for (let i2 = 0; i2 < arr.length; i2++) {
          const tagObj = arr[i2];
          const property = propName(tagObj);
          let newJpath = "";
          if (jPath === void 0)
            newJpath = property;
          else
            newJpath = jPath + "." + property;
          if (property === options.textNodeName) {
            if (text === void 0)
              text = tagObj[property];
            else
              text += "" + tagObj[property];
          } else if (property === void 0) {
            continue;
          } else if (tagObj[property]) {
            let val2 = compress(tagObj[property], options, newJpath);
            const isLeaf = isLeafTag(val2, options);
            if (tagObj[":@"]) {
              assignAttributes(val2, tagObj[":@"], newJpath, options);
            } else if (Object.keys(val2).length === 1 && val2[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
              val2 = val2[options.textNodeName];
            } else if (Object.keys(val2).length === 0) {
              if (options.alwaysCreateTextNode)
                val2[options.textNodeName] = "";
              else
                val2 = "";
            }
            if (compressedObj[property] !== void 0 && compressedObj.hasOwnProperty(property)) {
              if (!Array.isArray(compressedObj[property])) {
                compressedObj[property] = [compressedObj[property]];
              }
              compressedObj[property].push(val2);
            } else {
              if (options.isArray(property, newJpath, isLeaf)) {
                compressedObj[property] = [val2];
              } else {
                compressedObj[property] = val2;
              }
            }
          }
        }
        if (typeof text === "string") {
          if (text.length > 0)
            compressedObj[options.textNodeName] = text;
        } else if (text !== void 0)
          compressedObj[options.textNodeName] = text;
        return compressedObj;
      }
      function propName(obj) {
        const keys = Object.keys(obj);
        for (let i2 = 0; i2 < keys.length; i2++) {
          const key = keys[i2];
          if (key !== ":@")
            return key;
        }
      }
      function assignAttributes(obj, attrMap, jpath, options) {
        if (attrMap) {
          const keys = Object.keys(attrMap);
          const len = keys.length;
          for (let i2 = 0; i2 < len; i2++) {
            const atrrName = keys[i2];
            if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
              obj[atrrName] = [attrMap[atrrName]];
            } else {
              obj[atrrName] = attrMap[atrrName];
            }
          }
        }
      }
      function isLeafTag(obj, options) {
        const { textNodeName } = options;
        const propCount = Object.keys(obj).length;
        if (propCount === 0) {
          return true;
        }
        if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
          return true;
        }
        return false;
      }
      exports.prettify = prettify;
    }
  });

  // node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
  var require_XMLParser = __commonJS({
    "node_modules/fast-xml-parser/src/xmlparser/XMLParser.js"(exports, module) {
      var { buildOptions } = require_OptionsBuilder();
      var OrderedObjParser = require_OrderedObjParser();
      var { prettify } = require_node2json();
      var validator = require_validator();
      var XMLParser2 = class {
        constructor(options) {
          this.externalEntities = {};
          this.options = buildOptions(options);
        }
        /**
         * Parse XML dats to JS object 
         * @param {string|Buffer} xmlData 
         * @param {boolean|Object} validationOption 
         */
        parse(xmlData, validationOption) {
          if (typeof xmlData === "string") {
          } else if (xmlData.toString) {
            xmlData = xmlData.toString();
          } else {
            throw new Error("XML data is accepted in String or Bytes[] form.");
          }
          if (validationOption) {
            if (validationOption === true)
              validationOption = {};
            const result = validator.validate(xmlData, validationOption);
            if (result !== true) {
              throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
            }
          }
          const orderedObjParser = new OrderedObjParser(this.options);
          orderedObjParser.addExternalEntities(this.externalEntities);
          const orderedResult = orderedObjParser.parseXml(xmlData);
          if (this.options.preserveOrder || orderedResult === void 0)
            return orderedResult;
          else
            return prettify(orderedResult, this.options);
        }
        /**
         * Add Entity which is not by default supported by this library
         * @param {string} key 
         * @param {string} value 
         */
        addEntity(key, value) {
          if (value.indexOf("&") !== -1) {
            throw new Error("Entity value can't have '&'");
          } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
            throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
          } else if (value === "&") {
            throw new Error("An entity with value '&' is not permitted");
          } else {
            this.externalEntities[key] = value;
          }
        }
      };
      module.exports = XMLParser2;
    }
  });

  // node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js
  var require_orderedJs2Xml = __commonJS({
    "node_modules/fast-xml-parser/src/xmlbuilder/orderedJs2Xml.js"(exports, module) {
      var EOL = "\n";
      function toXml(jArray, options) {
        let indentation = "";
        if (options.format && options.indentBy.length > 0) {
          indentation = EOL;
        }
        return arrToStr(jArray, options, "", indentation);
      }
      function arrToStr(arr, options, jPath, indentation) {
        let xmlStr = "";
        let isPreviousElementTag = false;
        for (let i2 = 0; i2 < arr.length; i2++) {
          const tagObj = arr[i2];
          const tagName = propName(tagObj);
          if (tagName === void 0)
            continue;
          let newJPath = "";
          if (jPath.length === 0)
            newJPath = tagName;
          else
            newJPath = `${jPath}.${tagName}`;
          if (tagName === options.textNodeName) {
            let tagText = tagObj[tagName];
            if (!isStopNode(newJPath, options)) {
              tagText = options.tagValueProcessor(tagName, tagText);
              tagText = replaceEntitiesValue(tagText, options);
            }
            if (isPreviousElementTag) {
              xmlStr += indentation;
            }
            xmlStr += tagText;
            isPreviousElementTag = false;
            continue;
          } else if (tagName === options.cdataPropName) {
            if (isPreviousElementTag) {
              xmlStr += indentation;
            }
            xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
            isPreviousElementTag = false;
            continue;
          } else if (tagName === options.commentPropName) {
            xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
            isPreviousElementTag = true;
            continue;
          } else if (tagName[0] === "?") {
            const attStr2 = attr_to_str(tagObj[":@"], options);
            const tempInd = tagName === "?xml" ? "" : indentation;
            let piTextNodeName = tagObj[tagName][0][options.textNodeName];
            piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : "";
            xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr2}?>`;
            isPreviousElementTag = true;
            continue;
          }
          let newIdentation = indentation;
          if (newIdentation !== "") {
            newIdentation += options.indentBy;
          }
          const attStr = attr_to_str(tagObj[":@"], options);
          const tagStart = indentation + `<${tagName}${attStr}`;
          const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
          if (options.unpairedTags.indexOf(tagName) !== -1) {
            if (options.suppressUnpairedNode)
              xmlStr += tagStart + ">";
            else
              xmlStr += tagStart + "/>";
          } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
            xmlStr += tagStart + "/>";
          } else if (tagValue && tagValue.endsWith(">")) {
            xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
          } else {
            xmlStr += tagStart + ">";
            if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
              xmlStr += indentation + options.indentBy + tagValue + indentation;
            } else {
              xmlStr += tagValue;
            }
            xmlStr += `</${tagName}>`;
          }
          isPreviousElementTag = true;
        }
        return xmlStr;
      }
      function propName(obj) {
        const keys = Object.keys(obj);
        for (let i2 = 0; i2 < keys.length; i2++) {
          const key = keys[i2];
          if (!obj.hasOwnProperty(key))
            continue;
          if (key !== ":@")
            return key;
        }
      }
      function attr_to_str(attrMap, options) {
        let attrStr = "";
        if (attrMap && !options.ignoreAttributes) {
          for (let attr in attrMap) {
            if (!attrMap.hasOwnProperty(attr))
              continue;
            let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
            attrVal = replaceEntitiesValue(attrVal, options);
            if (attrVal === true && options.suppressBooleanAttributes) {
              attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
            } else {
              attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
            }
          }
        }
        return attrStr;
      }
      function isStopNode(jPath, options) {
        jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
        let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
        for (let index in options.stopNodes) {
          if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName)
            return true;
        }
        return false;
      }
      function replaceEntitiesValue(textValue, options) {
        if (textValue && textValue.length > 0 && options.processEntities) {
          for (let i2 = 0; i2 < options.entities.length; i2++) {
            const entity = options.entities[i2];
            textValue = textValue.replace(entity.regex, entity.val);
          }
        }
        return textValue;
      }
      module.exports = toXml;
    }
  });

  // node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js
  var require_json2xml = __commonJS({
    "node_modules/fast-xml-parser/src/xmlbuilder/json2xml.js"(exports, module) {
      "use strict";
      var buildFromOrderedJs = require_orderedJs2Xml();
      var defaultOptions = {
        attributeNamePrefix: "@_",
        attributesGroupName: false,
        textNodeName: "#text",
        ignoreAttributes: true,
        cdataPropName: false,
        format: false,
        indentBy: "  ",
        suppressEmptyNode: false,
        suppressUnpairedNode: true,
        suppressBooleanAttributes: true,
        tagValueProcessor: function(key, a2) {
          return a2;
        },
        attributeValueProcessor: function(attrName, a2) {
          return a2;
        },
        preserveOrder: false,
        commentPropName: false,
        unpairedTags: [],
        entities: [
          { regex: new RegExp("&", "g"), val: "&amp;" },
          //it must be on top
          { regex: new RegExp(">", "g"), val: "&gt;" },
          { regex: new RegExp("<", "g"), val: "&lt;" },
          { regex: new RegExp("'", "g"), val: "&apos;" },
          { regex: new RegExp('"', "g"), val: "&quot;" }
        ],
        processEntities: true,
        stopNodes: [],
        // transformTagName: false,
        // transformAttributeName: false,
        oneListGroup: false
      };
      function Builder(options) {
        this.options = Object.assign({}, defaultOptions, options);
        if (this.options.ignoreAttributes || this.options.attributesGroupName) {
          this.isAttribute = function() {
            return false;
          };
        } else {
          this.attrPrefixLen = this.options.attributeNamePrefix.length;
          this.isAttribute = isAttribute;
        }
        this.processTextOrObjNode = processTextOrObjNode;
        if (this.options.format) {
          this.indentate = indentate;
          this.tagEndChar = ">\n";
          this.newLine = "\n";
        } else {
          this.indentate = function() {
            return "";
          };
          this.tagEndChar = ">";
          this.newLine = "";
        }
      }
      Builder.prototype.build = function(jObj) {
        if (this.options.preserveOrder) {
          return buildFromOrderedJs(jObj, this.options);
        } else {
          if (Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1) {
            jObj = {
              [this.options.arrayNodeName]: jObj
            };
          }
          return this.j2x(jObj, 0).val;
        }
      };
      Builder.prototype.j2x = function(jObj, level) {
        let attrStr = "";
        let val2 = "";
        for (let key in jObj) {
          if (!Object.prototype.hasOwnProperty.call(jObj, key))
            continue;
          if (typeof jObj[key] === "undefined") {
            if (this.isAttribute(key)) {
              val2 += "";
            }
          } else if (jObj[key] === null) {
            if (this.isAttribute(key)) {
              val2 += "";
            } else if (key[0] === "?") {
              val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
            } else {
              val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
            }
          } else if (jObj[key] instanceof Date) {
            val2 += this.buildTextValNode(jObj[key], key, "", level);
          } else if (typeof jObj[key] !== "object") {
            const attr = this.isAttribute(key);
            if (attr) {
              attrStr += this.buildAttrPairStr(attr, "" + jObj[key]);
            } else {
              if (key === this.options.textNodeName) {
                let newval = this.options.tagValueProcessor(key, "" + jObj[key]);
                val2 += this.replaceEntitiesValue(newval);
              } else {
                val2 += this.buildTextValNode(jObj[key], key, "", level);
              }
            }
          } else if (Array.isArray(jObj[key])) {
            const arrLen = jObj[key].length;
            let listTagVal = "";
            let listTagAttr = "";
            for (let j2 = 0; j2 < arrLen; j2++) {
              const item = jObj[key][j2];
              if (typeof item === "undefined") {
              } else if (item === null) {
                if (key[0] === "?")
                  val2 += this.indentate(level) + "<" + key + "?" + this.tagEndChar;
                else
                  val2 += this.indentate(level) + "<" + key + "/" + this.tagEndChar;
              } else if (typeof item === "object") {
                if (this.options.oneListGroup) {
                  const result = this.j2x(item, level + 1);
                  listTagVal += result.val;
                  if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
                    listTagAttr += result.attrStr;
                  }
                } else {
                  listTagVal += this.processTextOrObjNode(item, key, level);
                }
              } else {
                if (this.options.oneListGroup) {
                  let textValue = this.options.tagValueProcessor(key, item);
                  textValue = this.replaceEntitiesValue(textValue);
                  listTagVal += textValue;
                } else {
                  listTagVal += this.buildTextValNode(item, key, "", level);
                }
              }
            }
            if (this.options.oneListGroup) {
              listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
            }
            val2 += listTagVal;
          } else {
            if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
              const Ks = Object.keys(jObj[key]);
              const L2 = Ks.length;
              for (let j2 = 0; j2 < L2; j2++) {
                attrStr += this.buildAttrPairStr(Ks[j2], "" + jObj[key][Ks[j2]]);
              }
            } else {
              val2 += this.processTextOrObjNode(jObj[key], key, level);
            }
          }
        }
        return { attrStr, val: val2 };
      };
      Builder.prototype.buildAttrPairStr = function(attrName, val2) {
        val2 = this.options.attributeValueProcessor(attrName, "" + val2);
        val2 = this.replaceEntitiesValue(val2);
        if (this.options.suppressBooleanAttributes && val2 === "true") {
          return " " + attrName;
        } else
          return " " + attrName + '="' + val2 + '"';
      };
      function processTextOrObjNode(object, key, level) {
        const result = this.j2x(object, level + 1);
        if (object[this.options.textNodeName] !== void 0 && Object.keys(object).length === 1) {
          return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
        } else {
          return this.buildObjectNode(result.val, key, result.attrStr, level);
        }
      }
      Builder.prototype.buildObjectNode = function(val2, key, attrStr, level) {
        if (val2 === "") {
          if (key[0] === "?")
            return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
          else {
            return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
          }
        } else {
          let tagEndExp = "</" + key + this.tagEndChar;
          let piClosingChar = "";
          if (key[0] === "?") {
            piClosingChar = "?";
            tagEndExp = "";
          }
          if ((attrStr || attrStr === "") && val2.indexOf("<") === -1) {
            return this.indentate(level) + "<" + key + attrStr + piClosingChar + ">" + val2 + tagEndExp;
          } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
            return this.indentate(level) + `<!--${val2}-->` + this.newLine;
          } else {
            return this.indentate(level) + "<" + key + attrStr + piClosingChar + this.tagEndChar + val2 + this.indentate(level) + tagEndExp;
          }
        }
      };
      Builder.prototype.closeTag = function(key) {
        let closeTag = "";
        if (this.options.unpairedTags.indexOf(key) !== -1) {
          if (!this.options.suppressUnpairedNode)
            closeTag = "/";
        } else if (this.options.suppressEmptyNode) {
          closeTag = "/";
        } else {
          closeTag = `></${key}`;
        }
        return closeTag;
      };
      Builder.prototype.buildTextValNode = function(val2, key, attrStr, level) {
        if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
          return this.indentate(level) + `<![CDATA[${val2}]]>` + this.newLine;
        } else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
          return this.indentate(level) + `<!--${val2}-->` + this.newLine;
        } else if (key[0] === "?") {
          return this.indentate(level) + "<" + key + attrStr + "?" + this.tagEndChar;
        } else {
          let textValue = this.options.tagValueProcessor(key, val2);
          textValue = this.replaceEntitiesValue(textValue);
          if (textValue === "") {
            return this.indentate(level) + "<" + key + attrStr + this.closeTag(key) + this.tagEndChar;
          } else {
            return this.indentate(level) + "<" + key + attrStr + ">" + textValue + "</" + key + this.tagEndChar;
          }
        }
      };
      Builder.prototype.replaceEntitiesValue = function(textValue) {
        if (textValue && textValue.length > 0 && this.options.processEntities) {
          for (let i2 = 0; i2 < this.options.entities.length; i2++) {
            const entity = this.options.entities[i2];
            textValue = textValue.replace(entity.regex, entity.val);
          }
        }
        return textValue;
      };
      function indentate(level) {
        return this.options.indentBy.repeat(level);
      }
      function isAttribute(name) {
        if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
          return name.substr(this.attrPrefixLen);
        } else {
          return false;
        }
      }
      module.exports = Builder;
    }
  });

  // node_modules/fast-xml-parser/src/fxp.js
  var require_fxp = __commonJS({
    "node_modules/fast-xml-parser/src/fxp.js"(exports, module) {
      "use strict";
      var validator = require_validator();
      var XMLParser2 = require_XMLParser();
      var XMLBuilder = require_json2xml();
      module.exports = {
        XMLParser: XMLParser2,
        XMLValidator: validator,
        XMLBuilder
      };
    }
  });

  // node_modules/bowser/es5.js
  var require_es5 = __commonJS({
    "node_modules/bowser/es5.js"(exports, module) {
      !function(e2, t2) {
        "object" == typeof exports && "object" == typeof module ? module.exports = t2() : "function" == typeof define && define.amd ? define([], t2) : "object" == typeof exports ? exports.bowser = t2() : e2.bowser = t2();
      }(exports, function() {
        return function(e2) {
          var t2 = {};
          function r2(n2) {
            if (t2[n2])
              return t2[n2].exports;
            var i2 = t2[n2] = { i: n2, l: false, exports: {} };
            return e2[n2].call(i2.exports, i2, i2.exports, r2), i2.l = true, i2.exports;
          }
          return r2.m = e2, r2.c = t2, r2.d = function(e3, t3, n2) {
            r2.o(e3, t3) || Object.defineProperty(e3, t3, { enumerable: true, get: n2 });
          }, r2.r = function(e3) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e3, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e3, "__esModule", { value: true });
          }, r2.t = function(e3, t3) {
            if (1 & t3 && (e3 = r2(e3)), 8 & t3)
              return e3;
            if (4 & t3 && "object" == typeof e3 && e3 && e3.__esModule)
              return e3;
            var n2 = /* @__PURE__ */ Object.create(null);
            if (r2.r(n2), Object.defineProperty(n2, "default", { enumerable: true, value: e3 }), 2 & t3 && "string" != typeof e3)
              for (var i2 in e3)
                r2.d(n2, i2, function(t4) {
                  return e3[t4];
                }.bind(null, i2));
            return n2;
          }, r2.n = function(e3) {
            var t3 = e3 && e3.__esModule ? function() {
              return e3.default;
            } : function() {
              return e3;
            };
            return r2.d(t3, "a", t3), t3;
          }, r2.o = function(e3, t3) {
            return Object.prototype.hasOwnProperty.call(e3, t3);
          }, r2.p = "", r2(r2.s = 90);
        }({ 17: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2 = r2(18), i2 = function() {
            function e3() {
            }
            return e3.getFirstMatch = function(e4, t3) {
              var r3 = t3.match(e4);
              return r3 && r3.length > 0 && r3[1] || "";
            }, e3.getSecondMatch = function(e4, t3) {
              var r3 = t3.match(e4);
              return r3 && r3.length > 1 && r3[2] || "";
            }, e3.matchAndReturnConst = function(e4, t3, r3) {
              if (e4.test(t3))
                return r3;
            }, e3.getWindowsVersionName = function(e4) {
              switch (e4) {
                case "NT":
                  return "NT";
                case "XP":
                  return "XP";
                case "NT 5.0":
                  return "2000";
                case "NT 5.1":
                  return "XP";
                case "NT 5.2":
                  return "2003";
                case "NT 6.0":
                  return "Vista";
                case "NT 6.1":
                  return "7";
                case "NT 6.2":
                  return "8";
                case "NT 6.3":
                  return "8.1";
                case "NT 10.0":
                  return "10";
                default:
                  return;
              }
            }, e3.getMacOSVersionName = function(e4) {
              var t3 = e4.split(".").splice(0, 2).map(function(e5) {
                return parseInt(e5, 10) || 0;
              });
              if (t3.push(0), 10 === t3[0])
                switch (t3[1]) {
                  case 5:
                    return "Leopard";
                  case 6:
                    return "Snow Leopard";
                  case 7:
                    return "Lion";
                  case 8:
                    return "Mountain Lion";
                  case 9:
                    return "Mavericks";
                  case 10:
                    return "Yosemite";
                  case 11:
                    return "El Capitan";
                  case 12:
                    return "Sierra";
                  case 13:
                    return "High Sierra";
                  case 14:
                    return "Mojave";
                  case 15:
                    return "Catalina";
                  default:
                    return;
                }
            }, e3.getAndroidVersionName = function(e4) {
              var t3 = e4.split(".").splice(0, 2).map(function(e5) {
                return parseInt(e5, 10) || 0;
              });
              if (t3.push(0), !(1 === t3[0] && t3[1] < 5))
                return 1 === t3[0] && t3[1] < 6 ? "Cupcake" : 1 === t3[0] && t3[1] >= 6 ? "Donut" : 2 === t3[0] && t3[1] < 2 ? "Eclair" : 2 === t3[0] && 2 === t3[1] ? "Froyo" : 2 === t3[0] && t3[1] > 2 ? "Gingerbread" : 3 === t3[0] ? "Honeycomb" : 4 === t3[0] && t3[1] < 1 ? "Ice Cream Sandwich" : 4 === t3[0] && t3[1] < 4 ? "Jelly Bean" : 4 === t3[0] && t3[1] >= 4 ? "KitKat" : 5 === t3[0] ? "Lollipop" : 6 === t3[0] ? "Marshmallow" : 7 === t3[0] ? "Nougat" : 8 === t3[0] ? "Oreo" : 9 === t3[0] ? "Pie" : void 0;
            }, e3.getVersionPrecision = function(e4) {
              return e4.split(".").length;
            }, e3.compareVersions = function(t3, r3, n3) {
              void 0 === n3 && (n3 = false);
              var i3 = e3.getVersionPrecision(t3), s3 = e3.getVersionPrecision(r3), a2 = Math.max(i3, s3), o2 = 0, u2 = e3.map([t3, r3], function(t4) {
                var r4 = a2 - e3.getVersionPrecision(t4), n4 = t4 + new Array(r4 + 1).join(".0");
                return e3.map(n4.split("."), function(e4) {
                  return new Array(20 - e4.length).join("0") + e4;
                }).reverse();
              });
              for (n3 && (o2 = a2 - Math.min(i3, s3)), a2 -= 1; a2 >= o2; ) {
                if (u2[0][a2] > u2[1][a2])
                  return 1;
                if (u2[0][a2] === u2[1][a2]) {
                  if (a2 === o2)
                    return 0;
                  a2 -= 1;
                } else if (u2[0][a2] < u2[1][a2])
                  return -1;
              }
            }, e3.map = function(e4, t3) {
              var r3, n3 = [];
              if (Array.prototype.map)
                return Array.prototype.map.call(e4, t3);
              for (r3 = 0; r3 < e4.length; r3 += 1)
                n3.push(t3(e4[r3]));
              return n3;
            }, e3.find = function(e4, t3) {
              var r3, n3;
              if (Array.prototype.find)
                return Array.prototype.find.call(e4, t3);
              for (r3 = 0, n3 = e4.length; r3 < n3; r3 += 1) {
                var i3 = e4[r3];
                if (t3(i3, r3))
                  return i3;
              }
            }, e3.assign = function(e4) {
              for (var t3, r3, n3 = e4, i3 = arguments.length, s3 = new Array(i3 > 1 ? i3 - 1 : 0), a2 = 1; a2 < i3; a2++)
                s3[a2 - 1] = arguments[a2];
              if (Object.assign)
                return Object.assign.apply(Object, [e4].concat(s3));
              var o2 = function() {
                var e5 = s3[t3];
                "object" == typeof e5 && null !== e5 && Object.keys(e5).forEach(function(t4) {
                  n3[t4] = e5[t4];
                });
              };
              for (t3 = 0, r3 = s3.length; t3 < r3; t3 += 1)
                o2();
              return e4;
            }, e3.getBrowserAlias = function(e4) {
              return n2.BROWSER_ALIASES_MAP[e4];
            }, e3.getBrowserTypeByAlias = function(e4) {
              return n2.BROWSER_MAP[e4] || "";
            }, e3;
          }();
          t2.default = i2, e2.exports = t2.default;
        }, 18: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.ENGINE_MAP = t2.OS_MAP = t2.PLATFORMS_MAP = t2.BROWSER_MAP = t2.BROWSER_ALIASES_MAP = void 0;
          t2.BROWSER_ALIASES_MAP = { "Amazon Silk": "amazon_silk", "Android Browser": "android", Bada: "bada", BlackBerry: "blackberry", Chrome: "chrome", Chromium: "chromium", Electron: "electron", Epiphany: "epiphany", Firefox: "firefox", Focus: "focus", Generic: "generic", "Google Search": "google_search", Googlebot: "googlebot", "Internet Explorer": "ie", "K-Meleon": "k_meleon", Maxthon: "maxthon", "Microsoft Edge": "edge", "MZ Browser": "mz", "NAVER Whale Browser": "naver", Opera: "opera", "Opera Coast": "opera_coast", PhantomJS: "phantomjs", Puffin: "puffin", QupZilla: "qupzilla", QQ: "qq", QQLite: "qqlite", Safari: "safari", Sailfish: "sailfish", "Samsung Internet for Android": "samsung_internet", SeaMonkey: "seamonkey", Sleipnir: "sleipnir", Swing: "swing", Tizen: "tizen", "UC Browser": "uc", Vivaldi: "vivaldi", "WebOS Browser": "webos", WeChat: "wechat", "Yandex Browser": "yandex", Roku: "roku" };
          t2.BROWSER_MAP = { amazon_silk: "Amazon Silk", android: "Android Browser", bada: "Bada", blackberry: "BlackBerry", chrome: "Chrome", chromium: "Chromium", electron: "Electron", epiphany: "Epiphany", firefox: "Firefox", focus: "Focus", generic: "Generic", googlebot: "Googlebot", google_search: "Google Search", ie: "Internet Explorer", k_meleon: "K-Meleon", maxthon: "Maxthon", edge: "Microsoft Edge", mz: "MZ Browser", naver: "NAVER Whale Browser", opera: "Opera", opera_coast: "Opera Coast", phantomjs: "PhantomJS", puffin: "Puffin", qupzilla: "QupZilla", qq: "QQ Browser", qqlite: "QQ Browser Lite", safari: "Safari", sailfish: "Sailfish", samsung_internet: "Samsung Internet for Android", seamonkey: "SeaMonkey", sleipnir: "Sleipnir", swing: "Swing", tizen: "Tizen", uc: "UC Browser", vivaldi: "Vivaldi", webos: "WebOS Browser", wechat: "WeChat", yandex: "Yandex Browser" };
          t2.PLATFORMS_MAP = { tablet: "tablet", mobile: "mobile", desktop: "desktop", tv: "tv" };
          t2.OS_MAP = { WindowsPhone: "Windows Phone", Windows: "Windows", MacOS: "macOS", iOS: "iOS", Android: "Android", WebOS: "WebOS", BlackBerry: "BlackBerry", Bada: "Bada", Tizen: "Tizen", Linux: "Linux", ChromeOS: "Chrome OS", PlayStation4: "PlayStation 4", Roku: "Roku" };
          t2.ENGINE_MAP = { EdgeHTML: "EdgeHTML", Blink: "Blink", Trident: "Trident", Presto: "Presto", Gecko: "Gecko", WebKit: "WebKit" };
        }, 90: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2, i2 = (n2 = r2(91)) && n2.__esModule ? n2 : { default: n2 }, s3 = r2(18);
          function a2(e3, t3) {
            for (var r3 = 0; r3 < t3.length; r3++) {
              var n3 = t3[r3];
              n3.enumerable = n3.enumerable || false, n3.configurable = true, "value" in n3 && (n3.writable = true), Object.defineProperty(e3, n3.key, n3);
            }
          }
          var o2 = function() {
            function e3() {
            }
            var t3, r3, n3;
            return e3.getParser = function(e4, t4) {
              if (void 0 === t4 && (t4 = false), "string" != typeof e4)
                throw new Error("UserAgent should be a string");
              return new i2.default(e4, t4);
            }, e3.parse = function(e4) {
              return new i2.default(e4).getResult();
            }, t3 = e3, n3 = [{ key: "BROWSER_MAP", get: function() {
              return s3.BROWSER_MAP;
            } }, { key: "ENGINE_MAP", get: function() {
              return s3.ENGINE_MAP;
            } }, { key: "OS_MAP", get: function() {
              return s3.OS_MAP;
            } }, { key: "PLATFORMS_MAP", get: function() {
              return s3.PLATFORMS_MAP;
            } }], (r3 = null) && a2(t3.prototype, r3), n3 && a2(t3, n3), e3;
          }();
          t2.default = o2, e2.exports = t2.default;
        }, 91: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2 = u2(r2(92)), i2 = u2(r2(93)), s3 = u2(r2(94)), a2 = u2(r2(95)), o2 = u2(r2(17));
          function u2(e3) {
            return e3 && e3.__esModule ? e3 : { default: e3 };
          }
          var d3 = function() {
            function e3(e4, t4) {
              if (void 0 === t4 && (t4 = false), null == e4 || "" === e4)
                throw new Error("UserAgent parameter can't be empty");
              this._ua = e4, this.parsedResult = {}, true !== t4 && this.parse();
            }
            var t3 = e3.prototype;
            return t3.getUA = function() {
              return this._ua;
            }, t3.test = function(e4) {
              return e4.test(this._ua);
            }, t3.parseBrowser = function() {
              var e4 = this;
              this.parsedResult.browser = {};
              var t4 = o2.default.find(n2.default, function(t5) {
                if ("function" == typeof t5.test)
                  return t5.test(e4);
                if (t5.test instanceof Array)
                  return t5.test.some(function(t6) {
                    return e4.test(t6);
                  });
                throw new Error("Browser's test function is not valid");
              });
              return t4 && (this.parsedResult.browser = t4.describe(this.getUA())), this.parsedResult.browser;
            }, t3.getBrowser = function() {
              return this.parsedResult.browser ? this.parsedResult.browser : this.parseBrowser();
            }, t3.getBrowserName = function(e4) {
              return e4 ? String(this.getBrowser().name).toLowerCase() || "" : this.getBrowser().name || "";
            }, t3.getBrowserVersion = function() {
              return this.getBrowser().version;
            }, t3.getOS = function() {
              return this.parsedResult.os ? this.parsedResult.os : this.parseOS();
            }, t3.parseOS = function() {
              var e4 = this;
              this.parsedResult.os = {};
              var t4 = o2.default.find(i2.default, function(t5) {
                if ("function" == typeof t5.test)
                  return t5.test(e4);
                if (t5.test instanceof Array)
                  return t5.test.some(function(t6) {
                    return e4.test(t6);
                  });
                throw new Error("Browser's test function is not valid");
              });
              return t4 && (this.parsedResult.os = t4.describe(this.getUA())), this.parsedResult.os;
            }, t3.getOSName = function(e4) {
              var t4 = this.getOS().name;
              return e4 ? String(t4).toLowerCase() || "" : t4 || "";
            }, t3.getOSVersion = function() {
              return this.getOS().version;
            }, t3.getPlatform = function() {
              return this.parsedResult.platform ? this.parsedResult.platform : this.parsePlatform();
            }, t3.getPlatformType = function(e4) {
              void 0 === e4 && (e4 = false);
              var t4 = this.getPlatform().type;
              return e4 ? String(t4).toLowerCase() || "" : t4 || "";
            }, t3.parsePlatform = function() {
              var e4 = this;
              this.parsedResult.platform = {};
              var t4 = o2.default.find(s3.default, function(t5) {
                if ("function" == typeof t5.test)
                  return t5.test(e4);
                if (t5.test instanceof Array)
                  return t5.test.some(function(t6) {
                    return e4.test(t6);
                  });
                throw new Error("Browser's test function is not valid");
              });
              return t4 && (this.parsedResult.platform = t4.describe(this.getUA())), this.parsedResult.platform;
            }, t3.getEngine = function() {
              return this.parsedResult.engine ? this.parsedResult.engine : this.parseEngine();
            }, t3.getEngineName = function(e4) {
              return e4 ? String(this.getEngine().name).toLowerCase() || "" : this.getEngine().name || "";
            }, t3.parseEngine = function() {
              var e4 = this;
              this.parsedResult.engine = {};
              var t4 = o2.default.find(a2.default, function(t5) {
                if ("function" == typeof t5.test)
                  return t5.test(e4);
                if (t5.test instanceof Array)
                  return t5.test.some(function(t6) {
                    return e4.test(t6);
                  });
                throw new Error("Browser's test function is not valid");
              });
              return t4 && (this.parsedResult.engine = t4.describe(this.getUA())), this.parsedResult.engine;
            }, t3.parse = function() {
              return this.parseBrowser(), this.parseOS(), this.parsePlatform(), this.parseEngine(), this;
            }, t3.getResult = function() {
              return o2.default.assign({}, this.parsedResult);
            }, t3.satisfies = function(e4) {
              var t4 = this, r3 = {}, n3 = 0, i3 = {}, s4 = 0;
              if (Object.keys(e4).forEach(function(t5) {
                var a4 = e4[t5];
                "string" == typeof a4 ? (i3[t5] = a4, s4 += 1) : "object" == typeof a4 && (r3[t5] = a4, n3 += 1);
              }), n3 > 0) {
                var a3 = Object.keys(r3), u3 = o2.default.find(a3, function(e5) {
                  return t4.isOS(e5);
                });
                if (u3) {
                  var d4 = this.satisfies(r3[u3]);
                  if (void 0 !== d4)
                    return d4;
                }
                var c2 = o2.default.find(a3, function(e5) {
                  return t4.isPlatform(e5);
                });
                if (c2) {
                  var f2 = this.satisfies(r3[c2]);
                  if (void 0 !== f2)
                    return f2;
                }
              }
              if (s4 > 0) {
                var l2 = Object.keys(i3), h3 = o2.default.find(l2, function(e5) {
                  return t4.isBrowser(e5, true);
                });
                if (void 0 !== h3)
                  return this.compareVersion(i3[h3]);
              }
            }, t3.isBrowser = function(e4, t4) {
              void 0 === t4 && (t4 = false);
              var r3 = this.getBrowserName().toLowerCase(), n3 = e4.toLowerCase(), i3 = o2.default.getBrowserTypeByAlias(n3);
              return t4 && i3 && (n3 = i3.toLowerCase()), n3 === r3;
            }, t3.compareVersion = function(e4) {
              var t4 = [0], r3 = e4, n3 = false, i3 = this.getBrowserVersion();
              if ("string" == typeof i3)
                return ">" === e4[0] || "<" === e4[0] ? (r3 = e4.substr(1), "=" === e4[1] ? (n3 = true, r3 = e4.substr(2)) : t4 = [], ">" === e4[0] ? t4.push(1) : t4.push(-1)) : "=" === e4[0] ? r3 = e4.substr(1) : "~" === e4[0] && (n3 = true, r3 = e4.substr(1)), t4.indexOf(o2.default.compareVersions(i3, r3, n3)) > -1;
            }, t3.isOS = function(e4) {
              return this.getOSName(true) === String(e4).toLowerCase();
            }, t3.isPlatform = function(e4) {
              return this.getPlatformType(true) === String(e4).toLowerCase();
            }, t3.isEngine = function(e4) {
              return this.getEngineName(true) === String(e4).toLowerCase();
            }, t3.is = function(e4, t4) {
              return void 0 === t4 && (t4 = false), this.isBrowser(e4, t4) || this.isOS(e4) || this.isPlatform(e4);
            }, t3.some = function(e4) {
              var t4 = this;
              return void 0 === e4 && (e4 = []), e4.some(function(e5) {
                return t4.is(e5);
              });
            }, e3;
          }();
          t2.default = d3, e2.exports = t2.default;
        }, 92: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2, i2 = (n2 = r2(17)) && n2.__esModule ? n2 : { default: n2 };
          var s3 = /version\/(\d+(\.?_?\d+)+)/i, a2 = [{ test: [/googlebot/i], describe: function(e3) {
            var t3 = { name: "Googlebot" }, r3 = i2.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/opera/i], describe: function(e3) {
            var t3 = { name: "Opera" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/opr\/|opios/i], describe: function(e3) {
            var t3 = { name: "Opera" }, r3 = i2.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/SamsungBrowser/i], describe: function(e3) {
            var t3 = { name: "Samsung Internet for Android" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/Whale/i], describe: function(e3) {
            var t3 = { name: "NAVER Whale Browser" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/MZBrowser/i], describe: function(e3) {
            var t3 = { name: "MZ Browser" }, r3 = i2.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/focus/i], describe: function(e3) {
            var t3 = { name: "Focus" }, r3 = i2.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/swing/i], describe: function(e3) {
            var t3 = { name: "Swing" }, r3 = i2.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/coast/i], describe: function(e3) {
            var t3 = { name: "Opera Coast" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/opt\/\d+(?:.?_?\d+)+/i], describe: function(e3) {
            var t3 = { name: "Opera Touch" }, r3 = i2.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/yabrowser/i], describe: function(e3) {
            var t3 = { name: "Yandex Browser" }, r3 = i2.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/ucbrowser/i], describe: function(e3) {
            var t3 = { name: "UC Browser" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/Maxthon|mxios/i], describe: function(e3) {
            var t3 = { name: "Maxthon" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/epiphany/i], describe: function(e3) {
            var t3 = { name: "Epiphany" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/puffin/i], describe: function(e3) {
            var t3 = { name: "Puffin" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/sleipnir/i], describe: function(e3) {
            var t3 = { name: "Sleipnir" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/k-meleon/i], describe: function(e3) {
            var t3 = { name: "K-Meleon" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/micromessenger/i], describe: function(e3) {
            var t3 = { name: "WeChat" }, r3 = i2.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/qqbrowser/i], describe: function(e3) {
            var t3 = { name: /qqbrowserlite/i.test(e3) ? "QQ Browser Lite" : "QQ Browser" }, r3 = i2.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/msie|trident/i], describe: function(e3) {
            var t3 = { name: "Internet Explorer" }, r3 = i2.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/\sedg\//i], describe: function(e3) {
            var t3 = { name: "Microsoft Edge" }, r3 = i2.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/edg([ea]|ios)/i], describe: function(e3) {
            var t3 = { name: "Microsoft Edge" }, r3 = i2.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/vivaldi/i], describe: function(e3) {
            var t3 = { name: "Vivaldi" }, r3 = i2.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/seamonkey/i], describe: function(e3) {
            var t3 = { name: "SeaMonkey" }, r3 = i2.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/sailfish/i], describe: function(e3) {
            var t3 = { name: "Sailfish" }, r3 = i2.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/silk/i], describe: function(e3) {
            var t3 = { name: "Amazon Silk" }, r3 = i2.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/phantom/i], describe: function(e3) {
            var t3 = { name: "PhantomJS" }, r3 = i2.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/slimerjs/i], describe: function(e3) {
            var t3 = { name: "SlimerJS" }, r3 = i2.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e3) {
            var t3 = { name: "BlackBerry" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/(web|hpw)[o0]s/i], describe: function(e3) {
            var t3 = { name: "WebOS Browser" }, r3 = i2.default.getFirstMatch(s3, e3) || i2.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/bada/i], describe: function(e3) {
            var t3 = { name: "Bada" }, r3 = i2.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/tizen/i], describe: function(e3) {
            var t3 = { name: "Tizen" }, r3 = i2.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/qupzilla/i], describe: function(e3) {
            var t3 = { name: "QupZilla" }, r3 = i2.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/firefox|iceweasel|fxios/i], describe: function(e3) {
            var t3 = { name: "Firefox" }, r3 = i2.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/electron/i], describe: function(e3) {
            var t3 = { name: "Electron" }, r3 = i2.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/MiuiBrowser/i], describe: function(e3) {
            var t3 = { name: "Miui" }, r3 = i2.default.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/chromium/i], describe: function(e3) {
            var t3 = { name: "Chromium" }, r3 = i2.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, e3) || i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/chrome|crios|crmo/i], describe: function(e3) {
            var t3 = { name: "Chrome" }, r3 = i2.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/GSA/i], describe: function(e3) {
            var t3 = { name: "Google Search" }, r3 = i2.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: function(e3) {
            var t3 = !e3.test(/like android/i), r3 = e3.test(/android/i);
            return t3 && r3;
          }, describe: function(e3) {
            var t3 = { name: "Android Browser" }, r3 = i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/playstation 4/i], describe: function(e3) {
            var t3 = { name: "PlayStation 4" }, r3 = i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/safari|applewebkit/i], describe: function(e3) {
            var t3 = { name: "Safari" }, r3 = i2.default.getFirstMatch(s3, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/.*/i], describe: function(e3) {
            var t3 = -1 !== e3.search("\\(") ? /^(.*)\/(.*)[ \t]\((.*)/ : /^(.*)\/(.*) /;
            return { name: i2.default.getFirstMatch(t3, e3), version: i2.default.getSecondMatch(t3, e3) };
          } }];
          t2.default = a2, e2.exports = t2.default;
        }, 93: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2, i2 = (n2 = r2(17)) && n2.__esModule ? n2 : { default: n2 }, s3 = r2(18);
          var a2 = [{ test: [/Roku\/DVP/], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, e3);
            return { name: s3.OS_MAP.Roku, version: t3 };
          } }, { test: [/windows phone/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, e3);
            return { name: s3.OS_MAP.WindowsPhone, version: t3 };
          } }, { test: [/windows /i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, e3), r3 = i2.default.getWindowsVersionName(t3);
            return { name: s3.OS_MAP.Windows, version: t3, versionName: r3 };
          } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function(e3) {
            var t3 = { name: s3.OS_MAP.iOS }, r3 = i2.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/macintosh/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, e3).replace(/[_\s]/g, "."), r3 = i2.default.getMacOSVersionName(t3), n3 = { name: s3.OS_MAP.MacOS, version: t3 };
            return r3 && (n3.versionName = r3), n3;
          } }, { test: [/(ipod|iphone|ipad)/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, e3).replace(/[_\s]/g, ".");
            return { name: s3.OS_MAP.iOS, version: t3 };
          } }, { test: function(e3) {
            var t3 = !e3.test(/like android/i), r3 = e3.test(/android/i);
            return t3 && r3;
          }, describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, e3), r3 = i2.default.getAndroidVersionName(t3), n3 = { name: s3.OS_MAP.Android, version: t3 };
            return r3 && (n3.versionName = r3), n3;
          } }, { test: [/(web|hpw)[o0]s/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, e3), r3 = { name: s3.OS_MAP.WebOS };
            return t3 && t3.length && (r3.version = t3), r3;
          } }, { test: [/blackberry|\bbb\d+/i, /rim\stablet/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, e3) || i2.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, e3) || i2.default.getFirstMatch(/\bbb(\d+)/i, e3);
            return { name: s3.OS_MAP.BlackBerry, version: t3 };
          } }, { test: [/bada/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, e3);
            return { name: s3.OS_MAP.Bada, version: t3 };
          } }, { test: [/tizen/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, e3);
            return { name: s3.OS_MAP.Tizen, version: t3 };
          } }, { test: [/linux/i], describe: function() {
            return { name: s3.OS_MAP.Linux };
          } }, { test: [/CrOS/], describe: function() {
            return { name: s3.OS_MAP.ChromeOS };
          } }, { test: [/PlayStation 4/], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, e3);
            return { name: s3.OS_MAP.PlayStation4, version: t3 };
          } }];
          t2.default = a2, e2.exports = t2.default;
        }, 94: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2, i2 = (n2 = r2(17)) && n2.__esModule ? n2 : { default: n2 }, s3 = r2(18);
          var a2 = [{ test: [/googlebot/i], describe: function() {
            return { type: "bot", vendor: "Google" };
          } }, { test: [/huawei/i], describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/(can-l01)/i, e3) && "Nova", r3 = { type: s3.PLATFORMS_MAP.mobile, vendor: "Huawei" };
            return t3 && (r3.model = t3), r3;
          } }, { test: [/nexus\s*(?:7|8|9|10).*/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet, vendor: "Nexus" };
          } }, { test: [/ipad/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
          } }, { test: [/Macintosh(.*?) FxiOS(.*?)\//], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet, vendor: "Apple", model: "iPad" };
          } }, { test: [/kftt build/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet, vendor: "Amazon", model: "Kindle Fire HD 7" };
          } }, { test: [/silk/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet, vendor: "Amazon" };
          } }, { test: [/tablet(?! pc)/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet };
          } }, { test: function(e3) {
            var t3 = e3.test(/ipod|iphone/i), r3 = e3.test(/like (ipod|iphone)/i);
            return t3 && !r3;
          }, describe: function(e3) {
            var t3 = i2.default.getFirstMatch(/(ipod|iphone)/i, e3);
            return { type: s3.PLATFORMS_MAP.mobile, vendor: "Apple", model: t3 };
          } }, { test: [/nexus\s*[0-6].*/i, /galaxy nexus/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile, vendor: "Nexus" };
          } }, { test: [/[^-]mobi/i], describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile };
          } }, { test: function(e3) {
            return "blackberry" === e3.getBrowserName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile, vendor: "BlackBerry" };
          } }, { test: function(e3) {
            return "bada" === e3.getBrowserName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile };
          } }, { test: function(e3) {
            return "windows phone" === e3.getBrowserName();
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile, vendor: "Microsoft" };
          } }, { test: function(e3) {
            var t3 = Number(String(e3.getOSVersion()).split(".")[0]);
            return "android" === e3.getOSName(true) && t3 >= 3;
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.tablet };
          } }, { test: function(e3) {
            return "android" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.mobile };
          } }, { test: function(e3) {
            return "macos" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.desktop, vendor: "Apple" };
          } }, { test: function(e3) {
            return "windows" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.desktop };
          } }, { test: function(e3) {
            return "linux" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.desktop };
          } }, { test: function(e3) {
            return "playstation 4" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.tv };
          } }, { test: function(e3) {
            return "roku" === e3.getOSName(true);
          }, describe: function() {
            return { type: s3.PLATFORMS_MAP.tv };
          } }];
          t2.default = a2, e2.exports = t2.default;
        }, 95: function(e2, t2, r2) {
          "use strict";
          t2.__esModule = true, t2.default = void 0;
          var n2, i2 = (n2 = r2(17)) && n2.__esModule ? n2 : { default: n2 }, s3 = r2(18);
          var a2 = [{ test: function(e3) {
            return "microsoft edge" === e3.getBrowserName(true);
          }, describe: function(e3) {
            if (/\sedg\//i.test(e3))
              return { name: s3.ENGINE_MAP.Blink };
            var t3 = i2.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, e3);
            return { name: s3.ENGINE_MAP.EdgeHTML, version: t3 };
          } }, { test: [/trident/i], describe: function(e3) {
            var t3 = { name: s3.ENGINE_MAP.Trident }, r3 = i2.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: function(e3) {
            return e3.test(/presto/i);
          }, describe: function(e3) {
            var t3 = { name: s3.ENGINE_MAP.Presto }, r3 = i2.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: function(e3) {
            var t3 = e3.test(/gecko/i), r3 = e3.test(/like gecko/i);
            return t3 && !r3;
          }, describe: function(e3) {
            var t3 = { name: s3.ENGINE_MAP.Gecko }, r3 = i2.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }, { test: [/(apple)?webkit\/537\.36/i], describe: function() {
            return { name: s3.ENGINE_MAP.Blink };
          } }, { test: [/(apple)?webkit/i], describe: function(e3) {
            var t3 = { name: s3.ENGINE_MAP.WebKit }, r3 = i2.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, e3);
            return r3 && (t3.version = r3), t3;
          } }];
          t2.default = a2, e2.exports = t2.default;
        } });
      });
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e2, m3;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i2 = isLE ? nBytes - 1 : 0;
        var d3 = isLE ? -1 : 1;
        var s3 = buffer[offset + i2];
        i2 += d3;
        e2 = s3 & (1 << -nBits) - 1;
        s3 >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e2 = e2 * 256 + buffer[offset + i2], i2 += d3, nBits -= 8) {
        }
        m3 = e2 & (1 << -nBits) - 1;
        e2 >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m3 = m3 * 256 + buffer[offset + i2], i2 += d3, nBits -= 8) {
        }
        if (e2 === 0) {
          e2 = 1 - eBias;
        } else if (e2 === eMax) {
          return m3 ? NaN : (s3 ? -1 : 1) * Infinity;
        } else {
          m3 = m3 + Math.pow(2, mLen);
          e2 = e2 - eBias;
        }
        return (s3 ? -1 : 1) * m3 * Math.pow(2, e2 - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e2, m3, c2;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i2 = isLE ? 0 : nBytes - 1;
        var d3 = isLE ? 1 : -1;
        var s3 = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m3 = isNaN(value) ? 1 : 0;
          e2 = eMax;
        } else {
          e2 = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c2 = Math.pow(2, -e2)) < 1) {
            e2--;
            c2 *= 2;
          }
          if (e2 + eBias >= 1) {
            value += rt / c2;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c2 >= 2) {
            e2++;
            c2 /= 2;
          }
          if (e2 + eBias >= eMax) {
            m3 = 0;
            e2 = eMax;
          } else if (e2 + eBias >= 1) {
            m3 = (value * c2 - 1) * Math.pow(2, mLen);
            e2 = e2 + eBias;
          } else {
            m3 = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e2 = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i2] = m3 & 255, i2 += d3, m3 /= 256, mLen -= 8) {
        }
        e2 = e2 << mLen | m3;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i2] = e2 & 255, i2 += d3, e2 /= 256, eLen -= 8) {
        }
        buffer[offset + i2 - d3] |= s3 * 128;
      };
    }
  });

  // node_modules/hono/dist/utils/body.js
  var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
    const { all = false, dot = false } = options;
    const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
    const contentType = headers.get("Content-Type");
    if (contentType !== null && contentType.startsWith("multipart/form-data") || contentType !== null && contentType.startsWith("application/x-www-form-urlencoded")) {
      return parseFormData(request, { all, dot });
    }
    return {};
  };
  async function parseFormData(request, options) {
    const formData = await request.formData();
    if (formData) {
      return convertFormDataToBodyData(formData, options);
    }
    return {};
  }
  function convertFormDataToBodyData(formData, options) {
    const form = /* @__PURE__ */ Object.create(null);
    formData.forEach((value, key) => {
      const shouldParseAllValues = options.all || key.endsWith("[]");
      if (!shouldParseAllValues) {
        form[key] = value;
      } else {
        handleParsingAllValues(form, key, value);
      }
    });
    if (options.dot) {
      Object.entries(form).forEach(([key, value]) => {
        const shouldParseDotValues = key.includes(".");
        if (shouldParseDotValues) {
          handleParsingNestedValues(form, key, value);
          delete form[key];
        }
      });
    }
    return form;
  }
  var handleParsingAllValues = (form, key, value) => {
    if (form[key] !== void 0) {
      if (Array.isArray(form[key])) {
        ;
        form[key].push(value);
      } else {
        form[key] = [form[key], value];
      }
    } else {
      form[key] = value;
    }
  };
  var handleParsingNestedValues = (form, key, value) => {
    let nestedForm = form;
    const keys = key.split(".");
    keys.forEach((key2, index) => {
      if (index === keys.length - 1) {
        nestedForm[key2] = value;
      } else {
        if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
          nestedForm[key2] = /* @__PURE__ */ Object.create(null);
        }
        nestedForm = nestedForm[key2];
      }
    });
  };

  // node_modules/hono/dist/utils/url.js
  var splitPath = (path) => {
    const paths = path.split("/");
    if (paths[0] === "") {
      paths.shift();
    }
    return paths;
  };
  var splitRoutingPath = (routePath) => {
    const { groups, path } = extractGroupsFromPath(routePath);
    const paths = splitPath(path);
    return replaceGroupMarks(paths, groups);
  };
  var extractGroupsFromPath = (path) => {
    const groups = [];
    path = path.replace(/\{[^}]+\}/g, (match2, index) => {
      const mark = `@${index}`;
      groups.push([mark, match2]);
      return mark;
    });
    return { groups, path };
  };
  var replaceGroupMarks = (paths, groups) => {
    for (let i2 = groups.length - 1; i2 >= 0; i2--) {
      const [mark] = groups[i2];
      for (let j2 = paths.length - 1; j2 >= 0; j2--) {
        if (paths[j2].includes(mark)) {
          paths[j2] = paths[j2].replace(mark, groups[i2][1]);
          break;
        }
      }
    }
    return paths;
  };
  var patternCache = {};
  var getPattern = (label) => {
    if (label === "*") {
      return "*";
    }
    const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match2) {
      if (!patternCache[label]) {
        if (match2[2]) {
          patternCache[label] = [label, match2[1], new RegExp("^" + match2[2] + "$")];
        } else {
          patternCache[label] = [label, match2[1], true];
        }
      }
      return patternCache[label];
    }
    return null;
  };
  var tryDecodeURI = (str2) => {
    try {
      return decodeURI(str2);
    } catch {
      return str2.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
        try {
          return decodeURI(match2);
        } catch {
          return match2;
        }
      });
    }
  };
  var getPath = (request) => {
    const url = request.url;
    const start = url.indexOf("/", 8);
    let i2 = start;
    for (; i2 < url.length; i2++) {
      const charCode = url.charCodeAt(i2);
      if (charCode === 37) {
        const queryIndex = url.indexOf("?", i2);
        const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
        return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
      } else if (charCode === 63) {
        break;
      }
    }
    return url.slice(start, i2);
  };
  var getPathNoStrict = (request) => {
    const result = getPath(request);
    return result.length > 1 && result[result.length - 1] === "/" ? result.slice(0, -1) : result;
  };
  var mergePath = (...paths) => {
    let p2 = "";
    let endsWithSlash = false;
    for (let path of paths) {
      if (p2[p2.length - 1] === "/") {
        p2 = p2.slice(0, -1);
        endsWithSlash = true;
      }
      if (path[0] !== "/") {
        path = `/${path}`;
      }
      if (path === "/" && endsWithSlash) {
        p2 = `${p2}/`;
      } else if (path !== "/") {
        p2 = `${p2}${path}`;
      }
      if (path === "/" && p2 === "") {
        p2 = "/";
      }
    }
    return p2;
  };
  var checkOptionalParameter = (path) => {
    if (!path.match(/\:.+\?$/)) {
      return null;
    }
    const segments = path.split("/");
    const results = [];
    let basePath = "";
    segments.forEach((segment) => {
      if (segment !== "" && !/\:/.test(segment)) {
        basePath += "/" + segment;
      } else if (/\:/.test(segment)) {
        if (/\?/.test(segment)) {
          if (results.length === 0 && basePath === "") {
            results.push("/");
          } else {
            results.push(basePath);
          }
          const optionalSegment = segment.replace("?", "");
          basePath += "/" + optionalSegment;
          results.push(basePath);
        } else {
          basePath += "/" + segment;
        }
      }
    });
    return results.filter((v2, i2, a2) => a2.indexOf(v2) === i2);
  };
  var _decodeURI = (value) => {
    if (!/[%+]/.test(value)) {
      return value;
    }
    if (value.indexOf("+") !== -1) {
      value = value.replace(/\+/g, " ");
    }
    return /%/.test(value) ? decodeURIComponent_(value) : value;
  };
  var _getQueryParam = (url, key, multiple) => {
    let encoded;
    if (!multiple && key && !/[%+]/.test(key)) {
      let keyIndex2 = url.indexOf(`?${key}`, 8);
      if (keyIndex2 === -1) {
        keyIndex2 = url.indexOf(`&${key}`, 8);
      }
      while (keyIndex2 !== -1) {
        const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
        if (trailingKeyCode === 61) {
          const valueIndex = keyIndex2 + key.length + 2;
          const endIndex = url.indexOf("&", valueIndex);
          return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
        } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
          return "";
        }
        keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
      }
      encoded = /[%+]/.test(url);
      if (!encoded) {
        return void 0;
      }
    }
    const results = {};
    encoded ??= /[%+]/.test(url);
    let keyIndex = url.indexOf("?", 8);
    while (keyIndex !== -1) {
      const nextKeyIndex = url.indexOf("&", keyIndex + 1);
      let valueIndex = url.indexOf("=", keyIndex);
      if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
        valueIndex = -1;
      }
      let name = url.slice(
        keyIndex + 1,
        valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
      );
      if (encoded) {
        name = _decodeURI(name);
      }
      keyIndex = nextKeyIndex;
      if (name === "") {
        continue;
      }
      let value;
      if (valueIndex === -1) {
        value = "";
      } else {
        value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
        if (encoded) {
          value = _decodeURI(value);
        }
      }
      if (multiple) {
        if (!(results[name] && Array.isArray(results[name]))) {
          results[name] = [];
        }
        ;
        results[name].push(value);
      } else {
        results[name] ??= value;
      }
    }
    return key ? results[key] : results;
  };
  var getQueryParam = _getQueryParam;
  var getQueryParams = (url, key) => {
    return _getQueryParam(url, key, true);
  };
  var decodeURIComponent_ = decodeURIComponent;

  // node_modules/hono/dist/request.js
  var HonoRequest = class {
    raw;
    #validatedData;
    #matchResult;
    routeIndex = 0;
    path;
    bodyCache = {};
    constructor(request, path = "/", matchResult = [[]]) {
      this.raw = request;
      this.path = path;
      this.#matchResult = matchResult;
      this.#validatedData = {};
    }
    param(key) {
      return key ? this.getDecodedParam(key) : this.getAllDecodedParams();
    }
    getDecodedParam(key) {
      const paramKey = this.#matchResult[0][this.routeIndex][1][key];
      const param = this.getParamValue(paramKey);
      return param ? /\%/.test(param) ? decodeURIComponent_(param) : param : void 0;
    }
    getAllDecodedParams() {
      const decoded = {};
      const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
      for (const key of keys) {
        const value = this.getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
        if (value && typeof value === "string") {
          decoded[key] = /\%/.test(value) ? decodeURIComponent_(value) : value;
        }
      }
      return decoded;
    }
    getParamValue(paramKey) {
      return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
    }
    query(key) {
      return getQueryParam(this.url, key);
    }
    queries(key) {
      return getQueryParams(this.url, key);
    }
    header(name) {
      if (name) {
        return this.raw.headers.get(name.toLowerCase()) ?? void 0;
      }
      const headerData = {};
      this.raw.headers.forEach((value, key) => {
        headerData[key] = value;
      });
      return headerData;
    }
    async parseBody(options) {
      return this.bodyCache.parsedBody ??= await parseBody(this, options);
    }
    cachedBody = (key) => {
      const { bodyCache, raw: raw2 } = this;
      const cachedBody = bodyCache[key];
      if (cachedBody) {
        return cachedBody;
      }
      const anyCachedKey = Object.keys(bodyCache)[0];
      if (anyCachedKey) {
        return bodyCache[anyCachedKey].then((body) => {
          if (anyCachedKey === "json") {
            body = JSON.stringify(body);
          }
          return new Response(body)[key]();
        });
      }
      return bodyCache[key] = raw2[key]();
    };
    json() {
      return this.cachedBody("json");
    }
    text() {
      return this.cachedBody("text");
    }
    arrayBuffer() {
      return this.cachedBody("arrayBuffer");
    }
    blob() {
      return this.cachedBody("blob");
    }
    formData() {
      return this.cachedBody("formData");
    }
    addValidatedData(target, data) {
      this.#validatedData[target] = data;
    }
    valid(target) {
      return this.#validatedData[target];
    }
    get url() {
      return this.raw.url;
    }
    get method() {
      return this.raw.method;
    }
    get matchedRoutes() {
      return this.#matchResult[0].map(([[, route]]) => route);
    }
    get routePath() {
      return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
    }
  };

  // node_modules/hono/dist/utils/html.js
  var HtmlEscapedCallbackPhase = {
    Stringify: 1,
    BeforeStream: 2,
    Stream: 3
  };
  var raw = (value, callbacks) => {
    const escapedString = new String(value);
    escapedString.isEscaped = true;
    escapedString.callbacks = callbacks;
    return escapedString;
  };
  var resolveCallback = async (str2, phase, preserveCallbacks, context, buffer) => {
    const callbacks = str2.callbacks;
    if (!callbacks?.length) {
      return Promise.resolve(str2);
    }
    if (buffer) {
      buffer[0] += str2;
    } else {
      buffer = [str2];
    }
    const resStr = Promise.all(callbacks.map((c2) => c2({ phase, buffer, context }))).then(
      (res) => Promise.all(
        res.filter(Boolean).map((str22) => resolveCallback(str22, phase, false, context, buffer))
      ).then(() => buffer[0])
    );
    if (preserveCallbacks) {
      return raw(await resStr, callbacks);
    } else {
      return resStr;
    }
  };

  // node_modules/hono/dist/context.js
  var TEXT_PLAIN = "text/plain; charset=UTF-8";
  var setHeaders = (headers, map2 = {}) => {
    Object.entries(map2).forEach(([key, value]) => headers.set(key, value));
    return headers;
  };
  var Context = class {
    #rawRequest;
    #req;
    env = {};
    #var;
    finalized = false;
    error;
    #status = 200;
    #executionCtx;
    #headers;
    #preparedHeaders;
    #res;
    #isFresh = true;
    #layout;
    #renderer;
    #notFoundHandler;
    #matchResult;
    #path;
    constructor(req, options) {
      this.#rawRequest = req;
      if (options) {
        this.#executionCtx = options.executionCtx;
        this.env = options.env;
        this.#notFoundHandler = options.notFoundHandler;
        this.#path = options.path;
        this.#matchResult = options.matchResult;
      }
    }
    get req() {
      this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
      return this.#req;
    }
    get event() {
      if (this.#executionCtx && "respondWith" in this.#executionCtx) {
        return this.#executionCtx;
      } else {
        throw Error("This context has no FetchEvent");
      }
    }
    get executionCtx() {
      if (this.#executionCtx) {
        return this.#executionCtx;
      } else {
        throw Error("This context has no ExecutionContext");
      }
    }
    get res() {
      this.#isFresh = false;
      return this.#res ||= new Response("404 Not Found", { status: 404 });
    }
    set res(_res) {
      this.#isFresh = false;
      if (this.#res && _res) {
        this.#res.headers.delete("content-type");
        for (const [k2, v2] of this.#res.headers.entries()) {
          if (k2 === "set-cookie") {
            const cookies = this.#res.headers.getSetCookie();
            _res.headers.delete("set-cookie");
            for (const cookie of cookies) {
              _res.headers.append("set-cookie", cookie);
            }
          } else {
            _res.headers.set(k2, v2);
          }
        }
      }
      this.#res = _res;
      this.finalized = true;
    }
    render = (...args) => {
      this.#renderer ??= (content) => this.html(content);
      return this.#renderer(...args);
    };
    setLayout = (layout) => this.#layout = layout;
    getLayout = () => this.#layout;
    setRenderer = (renderer) => {
      this.#renderer = renderer;
    };
    header = (name, value, options) => {
      if (value === void 0) {
        if (this.#headers) {
          this.#headers.delete(name);
        } else if (this.#preparedHeaders) {
          delete this.#preparedHeaders[name.toLocaleLowerCase()];
        }
        if (this.finalized) {
          this.res.headers.delete(name);
        }
        return;
      }
      if (options?.append) {
        if (!this.#headers) {
          this.#isFresh = false;
          this.#headers = new Headers(this.#preparedHeaders);
          this.#preparedHeaders = {};
        }
        this.#headers.append(name, value);
      } else {
        if (this.#headers) {
          this.#headers.set(name, value);
        } else {
          this.#preparedHeaders ??= {};
          this.#preparedHeaders[name.toLowerCase()] = value;
        }
      }
      if (this.finalized) {
        if (options?.append) {
          this.res.headers.append(name, value);
        } else {
          this.res.headers.set(name, value);
        }
      }
    };
    status = (status) => {
      this.#isFresh = false;
      this.#status = status;
    };
    set = (key, value) => {
      this.#var ??= /* @__PURE__ */ new Map();
      this.#var.set(key, value);
    };
    get = (key) => {
      return this.#var ? this.#var.get(key) : void 0;
    };
    get var() {
      if (!this.#var) {
        return {};
      }
      return Object.fromEntries(this.#var);
    }
    newResponse = (data, arg, headers) => {
      if (this.#isFresh && !headers && !arg && this.#status === 200) {
        return new Response(data, {
          headers: this.#preparedHeaders
        });
      }
      if (arg && typeof arg !== "number") {
        const header = new Headers(arg.headers);
        if (this.#headers) {
          this.#headers.forEach((v2, k2) => {
            if (k2 === "set-cookie") {
              header.append(k2, v2);
            } else {
              header.set(k2, v2);
            }
          });
        }
        const headers2 = setHeaders(header, this.#preparedHeaders);
        return new Response(data, {
          headers: headers2,
          status: arg.status ?? this.#status
        });
      }
      const status = typeof arg === "number" ? arg : this.#status;
      this.#preparedHeaders ??= {};
      this.#headers ??= new Headers();
      setHeaders(this.#headers, this.#preparedHeaders);
      if (this.#res) {
        this.#res.headers.forEach((v2, k2) => {
          if (k2 === "set-cookie") {
            this.#headers?.append(k2, v2);
          } else {
            this.#headers?.set(k2, v2);
          }
        });
        setHeaders(this.#headers, this.#preparedHeaders);
      }
      headers ??= {};
      for (const [k2, v2] of Object.entries(headers)) {
        if (typeof v2 === "string") {
          this.#headers.set(k2, v2);
        } else {
          this.#headers.delete(k2);
          for (const v22 of v2) {
            this.#headers.append(k2, v22);
          }
        }
      }
      return new Response(data, {
        status,
        headers: this.#headers
      });
    };
    body = (data, arg, headers) => {
      return typeof arg === "number" ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers) => {
      if (!this.#preparedHeaders) {
        if (this.#isFresh && !headers && !arg) {
          return new Response(text);
        }
        this.#preparedHeaders = {};
      }
      this.#preparedHeaders["content-type"] = TEXT_PLAIN;
      return typeof arg === "number" ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers) => {
      const body = JSON.stringify(object);
      this.#preparedHeaders ??= {};
      this.#preparedHeaders["content-type"] = "application/json; charset=UTF-8";
      return typeof arg === "number" ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    html = (html, arg, headers) => {
      this.#preparedHeaders ??= {};
      this.#preparedHeaders["content-type"] = "text/html; charset=UTF-8";
      if (typeof html === "object") {
        if (!(html instanceof Promise)) {
          html = html.toString();
        }
        if (html instanceof Promise) {
          return html.then((html2) => resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {})).then((html2) => {
            return typeof arg === "number" ? this.newResponse(html2, arg, headers) : this.newResponse(html2, arg);
          });
        }
      }
      return typeof arg === "number" ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status) => {
      this.#headers ??= new Headers();
      this.#headers.set("Location", location);
      return this.newResponse(null, status ?? 302);
    };
    notFound = () => {
      this.#notFoundHandler ??= () => new Response();
      return this.#notFoundHandler(this);
    };
  };

  // node_modules/hono/dist/compose.js
  var compose = (middleware, onError, onNotFound) => {
    return (context, next) => {
      let index = -1;
      return dispatch(0);
      async function dispatch(i2) {
        if (i2 <= index) {
          throw new Error("next() called multiple times");
        }
        index = i2;
        let res;
        let isError = false;
        let handler;
        if (middleware[i2]) {
          handler = middleware[i2][0][0];
          if (context instanceof Context) {
            context.req.routeIndex = i2;
          }
        } else {
          handler = i2 === middleware.length && next || void 0;
        }
        if (!handler) {
          if (context instanceof Context && context.finalized === false && onNotFound) {
            res = await onNotFound(context);
          }
        } else {
          try {
            res = await handler(context, () => {
              return dispatch(i2 + 1);
            });
          } catch (err) {
            if (err instanceof Error && context instanceof Context && onError) {
              context.error = err;
              res = await onError(err, context);
              isError = true;
            } else {
              throw err;
            }
          }
        }
        if (res && (context.finalized === false || isError)) {
          context.res = res;
        }
        return context;
      }
    };
  };

  // node_modules/hono/dist/router.js
  var METHOD_NAME_ALL = "ALL";
  var METHOD_NAME_ALL_LOWERCASE = "all";
  var METHODS = ["get", "post", "put", "delete", "options", "patch"];
  var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
  var UnsupportedPathError = class extends Error {
  };

  // node_modules/hono/dist/hono-base.js
  var COMPOSED_HANDLER = Symbol("composedHandler");
  var notFoundHandler = (c2) => {
    return c2.text("404 Not Found", 404);
  };
  var errorHandler = (err, c2) => {
    if ("getResponse" in err) {
      return err.getResponse();
    }
    console.error(err);
    return c2.text("Internal Server Error", 500);
  };
  var Hono = class {
    get;
    post;
    put;
    delete;
    options;
    patch;
    all;
    on;
    use;
    router;
    getPath;
    _basePath = "/";
    #path = "/";
    routes = [];
    constructor(options = {}) {
      const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
      allMethods.forEach((method) => {
        this[method] = (args1, ...args) => {
          if (typeof args1 === "string") {
            this.#path = args1;
          } else {
            this.addRoute(method, this.#path, args1);
          }
          args.forEach((handler) => {
            if (typeof handler !== "string") {
              this.addRoute(method, this.#path, handler);
            }
          });
          return this;
        };
      });
      this.on = (method, path, ...handlers) => {
        for (const p2 of [path].flat()) {
          this.#path = p2;
          for (const m3 of [method].flat()) {
            handlers.map((handler) => {
              this.addRoute(m3.toUpperCase(), this.#path, handler);
            });
          }
        }
        return this;
      };
      this.use = (arg1, ...handlers) => {
        if (typeof arg1 === "string") {
          this.#path = arg1;
        } else {
          this.#path = "*";
          handlers.unshift(arg1);
        }
        handlers.forEach((handler) => {
          this.addRoute(METHOD_NAME_ALL, this.#path, handler);
        });
        return this;
      };
      const strict = options.strict ?? true;
      delete options.strict;
      Object.assign(this, options);
      this.getPath = strict ? options.getPath ?? getPath : getPathNoStrict;
    }
    clone() {
      const clone = new Hono({
        router: this.router,
        getPath: this.getPath
      });
      clone.routes = this.routes;
      return clone;
    }
    notFoundHandler = notFoundHandler;
    errorHandler = errorHandler;
    route(path, app2) {
      const subApp = this.basePath(path);
      app2.routes.map((r2) => {
        let handler;
        if (app2.errorHandler === errorHandler) {
          handler = r2.handler;
        } else {
          handler = async (c2, next) => (await compose([], app2.errorHandler)(c2, () => r2.handler(c2, next))).res;
          handler[COMPOSED_HANDLER] = r2.handler;
        }
        subApp.addRoute(r2.method, r2.path, handler);
      });
      return this;
    }
    basePath(path) {
      const subApp = this.clone();
      subApp._basePath = mergePath(this._basePath, path);
      return subApp;
    }
    onError = (handler) => {
      this.errorHandler = handler;
      return this;
    };
    notFound = (handler) => {
      this.notFoundHandler = handler;
      return this;
    };
    mount(path, applicationHandler, options) {
      let replaceRequest;
      let optionHandler;
      if (options) {
        if (typeof options === "function") {
          optionHandler = options;
        } else {
          optionHandler = options.optionHandler;
          replaceRequest = options.replaceRequest;
        }
      }
      const getOptions = optionHandler ? (c2) => {
        const options2 = optionHandler(c2);
        return Array.isArray(options2) ? options2 : [options2];
      } : (c2) => {
        let executionContext = void 0;
        try {
          executionContext = c2.executionCtx;
        } catch {
        }
        return [c2.env, executionContext];
      };
      replaceRequest ||= (() => {
        const mergedPath = mergePath(this._basePath, path);
        const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
        return (request) => {
          const url = new URL(request.url);
          url.pathname = url.pathname.slice(pathPrefixLength) || "/";
          return new Request(url, request);
        };
      })();
      const handler = async (c2, next) => {
        const res = await applicationHandler(replaceRequest(c2.req.raw), ...getOptions(c2));
        if (res) {
          return res;
        }
        await next();
      };
      this.addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
      return this;
    }
    addRoute(method, path, handler) {
      method = method.toUpperCase();
      path = mergePath(this._basePath, path);
      const r2 = { path, method, handler };
      this.router.add(method, path, [handler, r2]);
      this.routes.push(r2);
    }
    matchRoute(method, path) {
      return this.router.match(method, path);
    }
    handleError(err, c2) {
      if (err instanceof Error) {
        return this.errorHandler(err, c2);
      }
      throw err;
    }
    dispatch(request, executionCtx, env, method) {
      if (method === "HEAD") {
        return (async () => new Response(null, await this.dispatch(request, executionCtx, env, "GET")))();
      }
      const path = this.getPath(request, { env });
      const matchResult = this.matchRoute(method, path);
      const c2 = new Context(request, {
        path,
        matchResult,
        env,
        executionCtx,
        notFoundHandler: this.notFoundHandler
      });
      if (matchResult[0].length === 1) {
        let res;
        try {
          res = matchResult[0][0][0][0](c2, async () => {
            c2.res = await this.notFoundHandler(c2);
          });
        } catch (err) {
          return this.handleError(err, c2);
        }
        return res instanceof Promise ? res.then(
          (resolved) => resolved || (c2.finalized ? c2.res : this.notFoundHandler(c2))
        ).catch((err) => this.handleError(err, c2)) : res ?? this.notFoundHandler(c2);
      }
      const composed = compose(matchResult[0], this.errorHandler, this.notFoundHandler);
      return (async () => {
        try {
          const context = await composed(c2);
          if (!context.finalized) {
            throw new Error(
              "Context is not finalized. Did you forget to return a Response object or `await next()`?"
            );
          }
          return context.res;
        } catch (err) {
          return this.handleError(err, c2);
        }
      })();
    }
    fetch = (request, ...rest) => {
      return this.dispatch(request, rest[1], rest[0], request.method);
    };
    request = (input, requestInit, Env, executionCtx) => {
      if (input instanceof Request) {
        if (requestInit !== void 0) {
          input = new Request(input, requestInit);
        }
        return this.fetch(input, Env, executionCtx);
      }
      input = input.toString();
      const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`;
      const req = new Request(path, requestInit);
      return this.fetch(req, Env, executionCtx);
    };
    fire = () => {
      addEventListener("fetch", (event) => {
        event.respondWith(this.dispatch(event.request, event, void 0, event.request.method));
      });
    };
  };

  // node_modules/hono/dist/router/reg-exp-router/node.js
  var LABEL_REG_EXP_STR = "[^/]+";
  var ONLY_WILDCARD_REG_EXP_STR = ".*";
  var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
  var PATH_ERROR = Symbol();
  var regExpMetaChars = new Set(".\\+*[^]$()");
  function compareKey(a2, b2) {
    if (a2.length === 1) {
      return b2.length === 1 ? a2 < b2 ? -1 : 1 : -1;
    }
    if (b2.length === 1) {
      return 1;
    }
    if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
      return 1;
    } else if (b2 === ONLY_WILDCARD_REG_EXP_STR || b2 === TAIL_WILDCARD_REG_EXP_STR) {
      return -1;
    }
    if (a2 === LABEL_REG_EXP_STR) {
      return 1;
    } else if (b2 === LABEL_REG_EXP_STR) {
      return -1;
    }
    return a2.length === b2.length ? a2 < b2 ? -1 : 1 : b2.length - a2.length;
  }
  var Node = class {
    index;
    varIndex;
    children = /* @__PURE__ */ Object.create(null);
    insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
      if (tokens.length === 0) {
        if (this.index !== void 0) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        this.index = index;
        return;
      }
      const [token, ...restTokens] = tokens;
      const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let node;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        node = this.children[regexpStr];
        if (!node) {
          if (Object.keys(this.children).some(
            (k2) => k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
          )) {
            throw PATH_ERROR;
          }
          if (pathErrorCheckOnly) {
            return;
          }
          node = this.children[regexpStr] = new Node();
          if (name !== "") {
            node.varIndex = context.varIndex++;
          }
        }
        if (!pathErrorCheckOnly && name !== "") {
          paramMap.push([name, node.varIndex]);
        }
      } else {
        node = this.children[token];
        if (!node) {
          if (Object.keys(this.children).some(
            (k2) => k2.length > 1 && k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
          )) {
            throw PATH_ERROR;
          }
          if (pathErrorCheckOnly) {
            return;
          }
          node = this.children[token] = new Node();
        }
      }
      node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
    }
    buildRegExpStr() {
      const childKeys = Object.keys(this.children).sort(compareKey);
      const strList = childKeys.map((k2) => {
        const c2 = this.children[k2];
        return (typeof c2.varIndex === "number" ? `(${k2})@${c2.varIndex}` : regExpMetaChars.has(k2) ? `\\${k2}` : k2) + c2.buildRegExpStr();
      });
      if (typeof this.index === "number") {
        strList.unshift(`#${this.index}`);
      }
      if (strList.length === 0) {
        return "";
      }
      if (strList.length === 1) {
        return strList[0];
      }
      return "(?:" + strList.join("|") + ")";
    }
  };

  // node_modules/hono/dist/router/reg-exp-router/trie.js
  var Trie = class {
    context = { varIndex: 0 };
    root = new Node();
    insert(path, index, pathErrorCheckOnly) {
      const paramAssoc = [];
      const groups = [];
      for (let i2 = 0; ; ) {
        let replaced = false;
        path = path.replace(/\{[^}]+\}/g, (m3) => {
          const mark = `@\\${i2}`;
          groups[i2] = [mark, m3];
          i2++;
          replaced = true;
          return mark;
        });
        if (!replaced) {
          break;
        }
      }
      const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
      for (let i2 = groups.length - 1; i2 >= 0; i2--) {
        const [mark] = groups[i2];
        for (let j2 = tokens.length - 1; j2 >= 0; j2--) {
          if (tokens[j2].indexOf(mark) !== -1) {
            tokens[j2] = tokens[j2].replace(mark, groups[i2][1]);
            break;
          }
        }
      }
      this.root.insert(tokens, index, paramAssoc, this.context, pathErrorCheckOnly);
      return paramAssoc;
    }
    buildRegExp() {
      let regexp = this.root.buildRegExpStr();
      if (regexp === "") {
        return [/^$/, [], []];
      }
      let captureIndex = 0;
      const indexReplacementMap = [];
      const paramReplacementMap = [];
      regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
        if (typeof handlerIndex !== "undefined") {
          indexReplacementMap[++captureIndex] = Number(handlerIndex);
          return "$()";
        }
        if (typeof paramIndex !== "undefined") {
          paramReplacementMap[Number(paramIndex)] = ++captureIndex;
          return "";
        }
        return "";
      });
      return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
    }
  };

  // node_modules/hono/dist/router/reg-exp-router/router.js
  var emptyParam = [];
  var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
  var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
  function buildWildcardRegExp(path) {
    return wildcardRegExpCache[path] ??= new RegExp(
      path === "*" ? "" : `^${path.replace(
        /\/\*$|([.\\+*[^\]$()])/g,
        (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
      )}$`
    );
  }
  function clearWildcardRegExpCache() {
    wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
  }
  function buildMatcherFromPreprocessedRoutes(routes) {
    const trie = new Trie();
    const handlerData = [];
    if (routes.length === 0) {
      return nullMatcher;
    }
    const routesWithStaticPathFlag = routes.map(
      (route) => [!/\*|\/:/.test(route[0]), ...route]
    ).sort(
      ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
    );
    const staticMap = /* @__PURE__ */ Object.create(null);
    for (let i2 = 0, j2 = -1, len = routesWithStaticPathFlag.length; i2 < len; i2++) {
      const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i2];
      if (pathErrorCheckOnly) {
        staticMap[path] = [handlers.map(([h3]) => [h3, /* @__PURE__ */ Object.create(null)]), emptyParam];
      } else {
        j2++;
      }
      let paramAssoc;
      try {
        paramAssoc = trie.insert(path, j2, pathErrorCheckOnly);
      } catch (e2) {
        throw e2 === PATH_ERROR ? new UnsupportedPathError(path) : e2;
      }
      if (pathErrorCheckOnly) {
        continue;
      }
      handlerData[j2] = handlers.map(([h3, paramCount]) => {
        const paramIndexMap = /* @__PURE__ */ Object.create(null);
        paramCount -= 1;
        for (; paramCount >= 0; paramCount--) {
          const [key, value] = paramAssoc[paramCount];
          paramIndexMap[key] = value;
        }
        return [h3, paramIndexMap];
      });
    }
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (let i2 = 0, len = handlerData.length; i2 < len; i2++) {
      for (let j2 = 0, len2 = handlerData[i2].length; j2 < len2; j2++) {
        const map2 = handlerData[i2][j2]?.[1];
        if (!map2) {
          continue;
        }
        const keys = Object.keys(map2);
        for (let k2 = 0, len3 = keys.length; k2 < len3; k2++) {
          map2[keys[k2]] = paramReplacementMap[map2[keys[k2]]];
        }
      }
    }
    const handlerMap = [];
    for (const i2 in indexReplacementMap) {
      handlerMap[i2] = handlerData[indexReplacementMap[i2]];
    }
    return [regexp, handlerMap, staticMap];
  }
  function findMiddleware(middleware, path) {
    if (!middleware) {
      return void 0;
    }
    for (const k2 of Object.keys(middleware).sort((a2, b2) => b2.length - a2.length)) {
      if (buildWildcardRegExp(k2).test(path)) {
        return [...middleware[k2]];
      }
    }
    return void 0;
  }
  var RegExpRouter = class {
    name = "RegExpRouter";
    middleware;
    routes;
    constructor() {
      this.middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
      this.routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    }
    add(method, path, handler) {
      const { middleware, routes } = this;
      if (!middleware || !routes) {
        throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      }
      if (!middleware[method]) {
        ;
        [middleware, routes].forEach((handlerMap) => {
          handlerMap[method] = /* @__PURE__ */ Object.create(null);
          Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p2) => {
            handlerMap[method][p2] = [...handlerMap[METHOD_NAME_ALL][p2]];
          });
        });
      }
      if (path === "/*") {
        path = "*";
      }
      const paramCount = (path.match(/\/:/g) || []).length;
      if (/\*$/.test(path)) {
        const re = buildWildcardRegExp(path);
        if (method === METHOD_NAME_ALL) {
          Object.keys(middleware).forEach((m3) => {
            middleware[m3][path] ||= findMiddleware(middleware[m3], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
          });
        } else {
          middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
        Object.keys(middleware).forEach((m3) => {
          if (method === METHOD_NAME_ALL || method === m3) {
            Object.keys(middleware[m3]).forEach((p2) => {
              re.test(p2) && middleware[m3][p2].push([handler, paramCount]);
            });
          }
        });
        Object.keys(routes).forEach((m3) => {
          if (method === METHOD_NAME_ALL || method === m3) {
            Object.keys(routes[m3]).forEach(
              (p2) => re.test(p2) && routes[m3][p2].push([handler, paramCount])
            );
          }
        });
        return;
      }
      const paths = checkOptionalParameter(path) || [path];
      for (let i2 = 0, len = paths.length; i2 < len; i2++) {
        const path2 = paths[i2];
        Object.keys(routes).forEach((m3) => {
          if (method === METHOD_NAME_ALL || method === m3) {
            routes[m3][path2] ||= [
              ...findMiddleware(middleware[m3], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
            ];
            routes[m3][path2].push([handler, paramCount - len + i2 + 1]);
          }
        });
      }
    }
    match(method, path) {
      clearWildcardRegExpCache();
      const matchers = this.buildAllMatchers();
      this.match = (method2, path2) => {
        const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
        const staticMatch = matcher[2][path2];
        if (staticMatch) {
          return staticMatch;
        }
        const match2 = path2.match(matcher[0]);
        if (!match2) {
          return [[], emptyParam];
        }
        const index = match2.indexOf("", 1);
        return [matcher[1][index], match2];
      };
      return this.match(method, path);
    }
    buildAllMatchers() {
      const matchers = /* @__PURE__ */ Object.create(null);
      [...Object.keys(this.routes), ...Object.keys(this.middleware)].forEach((method) => {
        matchers[method] ||= this.buildMatcher(method);
      });
      this.middleware = this.routes = void 0;
      return matchers;
    }
    buildMatcher(method) {
      const routes = [];
      let hasOwnRoute = method === METHOD_NAME_ALL;
      [this.middleware, this.routes].forEach((r2) => {
        const ownRoute = r2[method] ? Object.keys(r2[method]).map((path) => [path, r2[method][path]]) : [];
        if (ownRoute.length !== 0) {
          hasOwnRoute ||= true;
          routes.push(...ownRoute);
        } else if (method !== METHOD_NAME_ALL) {
          routes.push(
            ...Object.keys(r2[METHOD_NAME_ALL]).map((path) => [path, r2[METHOD_NAME_ALL][path]])
          );
        }
      });
      if (!hasOwnRoute) {
        return null;
      } else {
        return buildMatcherFromPreprocessedRoutes(routes);
      }
    }
  };

  // node_modules/hono/dist/router/smart-router/router.js
  var SmartRouter = class {
    name = "SmartRouter";
    routers = [];
    routes = [];
    constructor(init) {
      Object.assign(this, init);
    }
    add(method, path, handler) {
      if (!this.routes) {
        throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
      }
      this.routes.push([method, path, handler]);
    }
    match(method, path) {
      if (!this.routes) {
        throw new Error("Fatal error");
      }
      const { routers, routes } = this;
      const len = routers.length;
      let i2 = 0;
      let res;
      for (; i2 < len; i2++) {
        const router = routers[i2];
        try {
          routes.forEach((args) => {
            router.add(...args);
          });
          res = router.match(method, path);
        } catch (e2) {
          if (e2 instanceof UnsupportedPathError) {
            continue;
          }
          throw e2;
        }
        this.match = router.match.bind(router);
        this.routers = [router];
        this.routes = void 0;
        break;
      }
      if (i2 === len) {
        throw new Error("Fatal error");
      }
      this.name = `SmartRouter + ${this.activeRouter.name}`;
      return res;
    }
    get activeRouter() {
      if (this.routes || this.routers.length !== 1) {
        throw new Error("No active router has been determined yet.");
      }
      return this.routers[0];
    }
  };

  // node_modules/hono/dist/router/trie-router/node.js
  var Node2 = class {
    methods;
    children;
    patterns;
    order = 0;
    name;
    params = /* @__PURE__ */ Object.create(null);
    constructor(method, handler, children) {
      this.children = children || /* @__PURE__ */ Object.create(null);
      this.methods = [];
      this.name = "";
      if (method && handler) {
        const m3 = /* @__PURE__ */ Object.create(null);
        m3[method] = { handler, possibleKeys: [], score: 0, name: this.name };
        this.methods = [m3];
      }
      this.patterns = [];
    }
    insert(method, path, handler) {
      this.name = `${method} ${path}`;
      this.order = ++this.order;
      let curNode = this;
      const parts = splitRoutingPath(path);
      const possibleKeys = [];
      for (let i2 = 0, len = parts.length; i2 < len; i2++) {
        const p2 = parts[i2];
        if (Object.keys(curNode.children).includes(p2)) {
          curNode = curNode.children[p2];
          const pattern2 = getPattern(p2);
          if (pattern2) {
            possibleKeys.push(pattern2[1]);
          }
          continue;
        }
        curNode.children[p2] = new Node2();
        const pattern = getPattern(p2);
        if (pattern) {
          curNode.patterns.push(pattern);
          possibleKeys.push(pattern[1]);
        }
        curNode = curNode.children[p2];
      }
      if (!curNode.methods.length) {
        curNode.methods = [];
      }
      const m3 = /* @__PURE__ */ Object.create(null);
      const handlerSet = {
        handler,
        possibleKeys: possibleKeys.filter((v2, i2, a2) => a2.indexOf(v2) === i2),
        name: this.name,
        score: this.order
      };
      m3[method] = handlerSet;
      curNode.methods.push(m3);
      return curNode;
    }
    gHSets(node, method, nodeParams, params) {
      const handlerSets = [];
      for (let i2 = 0, len = node.methods.length; i2 < len; i2++) {
        const m3 = node.methods[i2];
        const handlerSet = m3[method] || m3[METHOD_NAME_ALL];
        const processedSet = /* @__PURE__ */ Object.create(null);
        if (handlerSet !== void 0) {
          handlerSet.params = /* @__PURE__ */ Object.create(null);
          handlerSet.possibleKeys.forEach((key) => {
            const processed = processedSet[handlerSet.name];
            handlerSet.params[key] = params[key] && !processed ? params[key] : nodeParams[key] ?? params[key];
            processedSet[handlerSet.name] = true;
          });
          handlerSets.push(handlerSet);
        }
      }
      return handlerSets;
    }
    search(method, path) {
      const handlerSets = [];
      this.params = /* @__PURE__ */ Object.create(null);
      const curNode = this;
      let curNodes = [curNode];
      const parts = splitPath(path);
      for (let i2 = 0, len = parts.length; i2 < len; i2++) {
        const part = parts[i2];
        const isLast = i2 === len - 1;
        const tempNodes = [];
        for (let j2 = 0, len2 = curNodes.length; j2 < len2; j2++) {
          const node = curNodes[j2];
          const nextNode = node.children[part];
          if (nextNode) {
            nextNode.params = node.params;
            if (isLast === true) {
              if (nextNode.children["*"]) {
                handlerSets.push(
                  ...this.gHSets(nextNode.children["*"], method, node.params, /* @__PURE__ */ Object.create(null))
                );
              }
              handlerSets.push(...this.gHSets(nextNode, method, node.params, /* @__PURE__ */ Object.create(null)));
            } else {
              tempNodes.push(nextNode);
            }
          }
          for (let k2 = 0, len3 = node.patterns.length; k2 < len3; k2++) {
            const pattern = node.patterns[k2];
            const params = { ...node.params };
            if (pattern === "*") {
              const astNode = node.children["*"];
              if (astNode) {
                handlerSets.push(...this.gHSets(astNode, method, node.params, /* @__PURE__ */ Object.create(null)));
                tempNodes.push(astNode);
              }
              continue;
            }
            if (part === "") {
              continue;
            }
            const [key, name, matcher] = pattern;
            const child = node.children[key];
            const restPathString = parts.slice(i2).join("/");
            if (matcher instanceof RegExp && matcher.test(restPathString)) {
              params[name] = restPathString;
              handlerSets.push(...this.gHSets(child, method, node.params, params));
              continue;
            }
            if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
              if (typeof key === "string") {
                params[name] = part;
                if (isLast === true) {
                  handlerSets.push(...this.gHSets(child, method, params, node.params));
                  if (child.children["*"]) {
                    handlerSets.push(...this.gHSets(child.children["*"], method, params, node.params));
                  }
                } else {
                  child.params = params;
                  tempNodes.push(child);
                }
              }
            }
          }
        }
        curNodes = tempNodes;
      }
      const results = handlerSets.sort((a2, b2) => {
        return a2.score - b2.score;
      });
      return [results.map(({ handler, params }) => [handler, params])];
    }
  };

  // node_modules/hono/dist/router/trie-router/router.js
  var TrieRouter = class {
    name = "TrieRouter";
    node;
    constructor() {
      this.node = new Node2();
    }
    add(method, path, handler) {
      const results = checkOptionalParameter(path);
      if (results) {
        for (const p2 of results) {
          this.node.insert(method, p2, handler);
        }
        return;
      }
      this.node.insert(method, path, handler);
    }
    match(method, path) {
      return this.node.search(method, path);
    }
  };

  // node_modules/hono/dist/hono.js
  var Hono2 = class extends Hono {
    constructor(options = {}) {
      super(options);
      this.router = options.router ?? new SmartRouter({
        routers: [new RegExpRouter(), new TrieRouter()]
      });
    }
  };

  // node_modules/grammy/out/web.mjs
  var filterQueryCache = /* @__PURE__ */ new Map();
  function matchFilter(filter) {
    const queries = Array.isArray(filter) ? filter : [
      filter
    ];
    const key = queries.join(",");
    const predicate = filterQueryCache.get(key) ?? (() => {
      const parsed = parse(queries);
      const pred = compile(parsed);
      filterQueryCache.set(key, pred);
      return pred;
    })();
    return (ctx) => predicate(ctx);
  }
  function parse(filter) {
    return Array.isArray(filter) ? filter.map((q2) => q2.split(":")) : [
      filter.split(":")
    ];
  }
  function compile(parsed) {
    const preprocessed = parsed.flatMap((q2) => check(q2, preprocess(q2)));
    const ltree = treeify(preprocessed);
    const predicate = arborist(ltree);
    return (ctx) => !!predicate(ctx.update, ctx);
  }
  function preprocess(filter) {
    const valid = UPDATE_KEYS;
    const expanded = [
      filter
    ].flatMap((q2) => {
      const [l1, l2, l3] = q2;
      if (!(l1 in L1_SHORTCUTS))
        return [
          q2
        ];
      if (!l1 && !l2 && !l3)
        return [
          q2
        ];
      const targets = L1_SHORTCUTS[l1];
      const expanded2 = targets.map((s3) => [
        s3,
        l2,
        l3
      ]);
      if (l2 === void 0)
        return expanded2;
      if (l2 in L2_SHORTCUTS && (l2 || l3))
        return expanded2;
      return expanded2.filter(([s3]) => !!valid[s3]?.[l2]);
    }).flatMap((q2) => {
      const [l1, l2, l3] = q2;
      if (!(l2 in L2_SHORTCUTS))
        return [
          q2
        ];
      if (!l2 && !l3)
        return [
          q2
        ];
      const targets = L2_SHORTCUTS[l2];
      const expanded2 = targets.map((s3) => [
        l1,
        s3,
        l3
      ]);
      if (l3 === void 0)
        return expanded2;
      return expanded2.filter(([, s3]) => !!valid[l1]?.[s3]?.[l3]);
    });
    if (expanded.length === 0) {
      throw new Error(`Shortcuts in '${filter.join(":")}' do not expand to any valid filter query`);
    }
    return expanded;
  }
  function check(original, preprocessed) {
    if (preprocessed.length === 0)
      throw new Error("Empty filter query given");
    const errors = preprocessed.map(checkOne).filter((r2) => r2 !== true);
    if (errors.length === 0)
      return preprocessed;
    else if (errors.length === 1)
      throw new Error(errors[0]);
    else {
      throw new Error(`Invalid filter query '${original.join(":")}'. There are ${errors.length} errors after expanding the contained shortcuts: ${errors.join("; ")}`);
    }
  }
  function checkOne(filter) {
    const [l1, l2, l3, ...n2] = filter;
    if (l1 === void 0)
      return "Empty filter query given";
    if (!(l1 in UPDATE_KEYS)) {
      const permitted = Object.keys(UPDATE_KEYS);
      return `Invalid L1 filter '${l1}' given in '${filter.join(":")}'. Permitted values are: ${permitted.map((k2) => `'${k2}'`).join(", ")}.`;
    }
    if (l2 === void 0)
      return true;
    const l1Obj = UPDATE_KEYS[l1];
    if (!(l2 in l1Obj)) {
      const permitted = Object.keys(l1Obj);
      return `Invalid L2 filter '${l2}' given in '${filter.join(":")}'. Permitted values are: ${permitted.map((k2) => `'${k2}'`).join(", ")}.`;
    }
    if (l3 === void 0)
      return true;
    const l2Obj = l1Obj[l2];
    if (!(l3 in l2Obj)) {
      const permitted = Object.keys(l2Obj);
      return `Invalid L3 filter '${l3}' given in '${filter.join(":")}'. ${permitted.length === 0 ? `No further filtering is possible after '${l1}:${l2}'.` : `Permitted values are: ${permitted.map((k2) => `'${k2}'`).join(", ")}.`}`;
    }
    if (n2.length === 0)
      return true;
    return `Cannot filter further than three levels, ':${n2.join(":")}' is invalid!`;
  }
  function treeify(paths) {
    const tree = {};
    for (const [l1, l2, l3] of paths) {
      const subtree = tree[l1] ??= {};
      if (l2 !== void 0) {
        const set = subtree[l2] ??= /* @__PURE__ */ new Set();
        if (l3 !== void 0)
          set.add(l3);
      }
    }
    return tree;
  }
  function or(left, right) {
    return (obj, ctx) => left(obj, ctx) || right(obj, ctx);
  }
  function concat(get, test) {
    return (obj, ctx) => {
      const nextObj = get(obj, ctx);
      return nextObj && test(nextObj, ctx);
    };
  }
  function leaf(pred) {
    return (obj, ctx) => pred(obj, ctx) != null;
  }
  function arborist(tree) {
    const l1Predicates = Object.entries(tree).map(([l1, subtree]) => {
      const l1Pred = (obj) => obj[l1];
      const l2Predicates = Object.entries(subtree).map(([l2, set]) => {
        const l2Pred = (obj) => obj[l2];
        const l3Predicates = Array.from(set).map((l3) => {
          const l3Pred = l3 === "me" ? (obj, ctx) => {
            const me = ctx.me.id;
            return testMaybeArray(obj, (u2) => u2.id === me);
          } : (obj) => testMaybeArray(obj, (e2) => e2[l3] || e2.type === l3);
          return l3Pred;
        });
        return l3Predicates.length === 0 ? leaf(l2Pred) : concat(l2Pred, l3Predicates.reduce(or));
      });
      return l2Predicates.length === 0 ? leaf(l1Pred) : concat(l1Pred, l2Predicates.reduce(or));
    });
    if (l1Predicates.length === 0) {
      throw new Error("Cannot create filter function for empty query");
    }
    return l1Predicates.reduce(or);
  }
  function testMaybeArray(t2, pred) {
    const p2 = (x2) => x2 != null && pred(x2);
    return Array.isArray(t2) ? t2.some(p2) : p2(t2);
  }
  var ENTITY_KEYS = {
    mention: {},
    hashtag: {},
    cashtag: {},
    bot_command: {},
    url: {},
    email: {},
    phone_number: {},
    bold: {},
    italic: {},
    underline: {},
    strikethrough: {},
    spoiler: {},
    blockquote: {},
    expandable_blockquote: {},
    code: {},
    pre: {},
    text_link: {},
    text_mention: {},
    custom_emoji: {}
  };
  var USER_KEYS = {
    me: {},
    is_bot: {},
    is_premium: {},
    added_to_attachment_menu: {}
  };
  var FORWARD_ORIGIN_KEYS = {
    user: {},
    hidden_user: {},
    chat: {},
    channel: {}
  };
  var STICKER_KEYS = {
    is_video: {},
    is_animated: {},
    premium_animation: {}
  };
  var REACTION_KEYS = {
    emoji: {},
    custom_emoji: {}
  };
  var COMMON_MESSAGE_KEYS = {
    forward_origin: FORWARD_ORIGIN_KEYS,
    is_topic_message: {},
    is_automatic_forward: {},
    business_connection_id: {},
    text: {},
    animation: {},
    audio: {},
    document: {},
    photo: {},
    sticker: STICKER_KEYS,
    story: {},
    video: {},
    video_note: {},
    voice: {},
    contact: {},
    dice: {},
    game: {},
    poll: {},
    venue: {},
    location: {},
    paid_media: {},
    entities: ENTITY_KEYS,
    caption_entities: ENTITY_KEYS,
    caption: {},
    effect_id: {},
    has_media_spoiler: {},
    new_chat_title: {},
    new_chat_photo: {},
    delete_chat_photo: {},
    message_auto_delete_timer_changed: {},
    pinned_message: {},
    chat_background_set: {},
    invoice: {},
    proximity_alert_triggered: {},
    video_chat_scheduled: {},
    video_chat_started: {},
    video_chat_ended: {},
    video_chat_participants_invited: {},
    web_app_data: {}
  };
  var MESSAGE_KEYS = {
    ...COMMON_MESSAGE_KEYS,
    sender_boost_count: {},
    new_chat_members: USER_KEYS,
    left_chat_member: USER_KEYS,
    group_chat_created: {},
    supergroup_chat_created: {},
    migrate_to_chat_id: {},
    migrate_from_chat_id: {},
    successful_payment: {},
    refunded_payment: {},
    boost_added: {},
    users_shared: {},
    chat_shared: {},
    connected_website: {},
    write_access_allowed: {},
    passport_data: {},
    forum_topic_created: {},
    forum_topic_edited: {
      name: {},
      icon_custom_emoji_id: {}
    },
    forum_topic_closed: {},
    forum_topic_reopened: {},
    general_forum_topic_hidden: {},
    general_forum_topic_unhidden: {}
  };
  var CHANNEL_POST_KEYS = {
    ...COMMON_MESSAGE_KEYS,
    channel_chat_created: {}
  };
  var BUSINESS_CONNECTION_KEYS = {
    can_reply: {},
    is_enabled: {}
  };
  var MESSAGE_REACTION_KEYS = {
    old_reaction: REACTION_KEYS,
    new_reaction: REACTION_KEYS
  };
  var MESSAGE_REACTION_COUNT_UPDATED_KEYS = {
    reactions: REACTION_KEYS
  };
  var CALLBACK_QUERY_KEYS = {
    data: {},
    game_short_name: {}
  };
  var CHAT_MEMBER_UPDATED_KEYS = {
    from: USER_KEYS
  };
  var UPDATE_KEYS = {
    message: MESSAGE_KEYS,
    edited_message: MESSAGE_KEYS,
    channel_post: CHANNEL_POST_KEYS,
    edited_channel_post: CHANNEL_POST_KEYS,
    business_connection: BUSINESS_CONNECTION_KEYS,
    business_message: MESSAGE_KEYS,
    edited_business_message: MESSAGE_KEYS,
    deleted_business_messages: {},
    inline_query: {},
    chosen_inline_result: {},
    callback_query: CALLBACK_QUERY_KEYS,
    shipping_query: {},
    pre_checkout_query: {},
    poll: {},
    poll_answer: {},
    my_chat_member: CHAT_MEMBER_UPDATED_KEYS,
    chat_member: CHAT_MEMBER_UPDATED_KEYS,
    chat_join_request: {},
    message_reaction: MESSAGE_REACTION_KEYS,
    message_reaction_count: MESSAGE_REACTION_COUNT_UPDATED_KEYS,
    chat_boost: {},
    removed_chat_boost: {}
  };
  var L1_SHORTCUTS = {
    "": [
      "message",
      "channel_post"
    ],
    msg: [
      "message",
      "channel_post"
    ],
    edit: [
      "edited_message",
      "edited_channel_post"
    ]
  };
  var L2_SHORTCUTS = {
    "": [
      "entities",
      "caption_entities"
    ],
    media: [
      "photo",
      "video"
    ],
    file: [
      "photo",
      "animation",
      "audio",
      "document",
      "video",
      "video_note",
      "voice",
      "sticker"
    ]
  };
  var checker = {
    filterQuery(filter) {
      const pred = matchFilter(filter);
      return (ctx) => pred(ctx);
    },
    text(trigger) {
      const hasText = checker.filterQuery([
        ":text",
        ":caption"
      ]);
      const trg = triggerFn(trigger);
      return (ctx) => {
        if (!hasText(ctx))
          return false;
        const msg = ctx.message ?? ctx.channelPost;
        const txt = msg.text ?? msg.caption;
        return match(ctx, txt, trg);
      };
    },
    command(command) {
      const hasEntities = checker.filterQuery(":entities:bot_command");
      const atCommands = /* @__PURE__ */ new Set();
      const noAtCommands = /* @__PURE__ */ new Set();
      toArray(command).forEach((cmd) => {
        if (cmd.startsWith("/")) {
          throw new Error(`Do not include '/' when registering command handlers (use '${cmd.substring(1)}' not '${cmd}')`);
        }
        const set = cmd.includes("@") ? atCommands : noAtCommands;
        set.add(cmd);
      });
      return (ctx) => {
        if (!hasEntities(ctx))
          return false;
        const msg = ctx.message ?? ctx.channelPost;
        const txt = msg.text ?? msg.caption;
        return msg.entities.some((e2) => {
          if (e2.type !== "bot_command")
            return false;
          if (e2.offset !== 0)
            return false;
          const cmd = txt.substring(1, e2.length);
          if (noAtCommands.has(cmd) || atCommands.has(cmd)) {
            ctx.match = txt.substring(cmd.length + 1).trimStart();
            return true;
          }
          const index = cmd.indexOf("@");
          if (index === -1)
            return false;
          const atTarget = cmd.substring(index + 1).toLowerCase();
          const username = ctx.me.username.toLowerCase();
          if (atTarget !== username)
            return false;
          const atCommand = cmd.substring(0, index);
          if (noAtCommands.has(atCommand)) {
            ctx.match = txt.substring(cmd.length + 1).trimStart();
            return true;
          }
          return false;
        });
      };
    },
    reaction(reaction) {
      const hasMessageReaction = checker.filterQuery("message_reaction");
      const normalized = typeof reaction === "string" ? [
        {
          type: "emoji",
          emoji: reaction
        }
      ] : (Array.isArray(reaction) ? reaction : [
        reaction
      ]).map((emoji) => typeof emoji === "string" ? {
        type: "emoji",
        emoji
      } : emoji);
      return (ctx) => {
        if (!hasMessageReaction(ctx))
          return false;
        const { old_reaction, new_reaction } = ctx.messageReaction;
        for (const reaction2 of new_reaction) {
          let isOld = false;
          if (reaction2.type === "emoji") {
            for (const old of old_reaction) {
              if (old.type !== "emoji")
                continue;
              if (old.emoji === reaction2.emoji) {
                isOld = true;
                break;
              }
            }
          } else if (reaction2.type === "custom_emoji") {
            for (const old of old_reaction) {
              if (old.type !== "custom_emoji")
                continue;
              if (old.custom_emoji_id === reaction2.custom_emoji_id) {
                isOld = true;
                break;
              }
            }
          } else {
          }
          if (!isOld) {
            if (reaction2.type === "emoji") {
              for (const wanted of normalized) {
                if (wanted.type !== "emoji")
                  continue;
                if (wanted.emoji === reaction2.emoji) {
                  return true;
                }
              }
            } else if (reaction2.type === "custom_emoji") {
              for (const wanted of normalized) {
                if (wanted.type !== "custom_emoji")
                  continue;
                if (wanted.custom_emoji_id === reaction2.custom_emoji_id) {
                  return true;
                }
              }
            } else {
              return true;
            }
          }
        }
        return false;
      };
    },
    chatType(chatType) {
      const set = new Set(toArray(chatType));
      return (ctx) => ctx.chat?.type !== void 0 && set.has(ctx.chat.type);
    },
    callbackQuery(trigger) {
      const hasCallbackQuery = checker.filterQuery("callback_query:data");
      const trg = triggerFn(trigger);
      return (ctx) => hasCallbackQuery(ctx) && match(ctx, ctx.callbackQuery.data, trg);
    },
    gameQuery(trigger) {
      const hasGameQuery = checker.filterQuery("callback_query:game_short_name");
      const trg = triggerFn(trigger);
      return (ctx) => hasGameQuery(ctx) && match(ctx, ctx.callbackQuery.game_short_name, trg);
    },
    inlineQuery(trigger) {
      const hasInlineQuery = checker.filterQuery("inline_query");
      const trg = triggerFn(trigger);
      return (ctx) => hasInlineQuery(ctx) && match(ctx, ctx.inlineQuery.query, trg);
    },
    chosenInlineResult(trigger) {
      const hasChosenInlineResult = checker.filterQuery("chosen_inline_result");
      const trg = triggerFn(trigger);
      return (ctx) => hasChosenInlineResult(ctx) && match(ctx, ctx.chosenInlineResult.result_id, trg);
    },
    preCheckoutQuery(trigger) {
      const hasPreCheckoutQuery = checker.filterQuery("pre_checkout_query");
      const trg = triggerFn(trigger);
      return (ctx) => hasPreCheckoutQuery(ctx) && match(ctx, ctx.preCheckoutQuery.invoice_payload, trg);
    },
    shippingQuery(trigger) {
      const hasShippingQuery = checker.filterQuery("shipping_query");
      const trg = triggerFn(trigger);
      return (ctx) => hasShippingQuery(ctx) && match(ctx, ctx.shippingQuery.invoice_payload, trg);
    }
  };
  var _Context = class {
    update;
    api;
    me;
    match;
    constructor(update, api, me) {
      this.update = update;
      this.api = api;
      this.me = me;
    }
    get message() {
      return this.update.message;
    }
    get editedMessage() {
      return this.update.edited_message;
    }
    get channelPost() {
      return this.update.channel_post;
    }
    get editedChannelPost() {
      return this.update.edited_channel_post;
    }
    get businessConnection() {
      return this.update.business_connection;
    }
    get businessMessage() {
      return this.update.business_message;
    }
    get editedBusinessMessage() {
      return this.update.edited_business_message;
    }
    get deletedBusinessMessages() {
      return this.update.deleted_business_messages;
    }
    get messageReaction() {
      return this.update.message_reaction;
    }
    get messageReactionCount() {
      return this.update.message_reaction_count;
    }
    get inlineQuery() {
      return this.update.inline_query;
    }
    get chosenInlineResult() {
      return this.update.chosen_inline_result;
    }
    get callbackQuery() {
      return this.update.callback_query;
    }
    get shippingQuery() {
      return this.update.shipping_query;
    }
    get preCheckoutQuery() {
      return this.update.pre_checkout_query;
    }
    get poll() {
      return this.update.poll;
    }
    get pollAnswer() {
      return this.update.poll_answer;
    }
    get myChatMember() {
      return this.update.my_chat_member;
    }
    get chatMember() {
      return this.update.chat_member;
    }
    get chatJoinRequest() {
      return this.update.chat_join_request;
    }
    get chatBoost() {
      return this.update.chat_boost;
    }
    get removedChatBoost() {
      return this.update.removed_chat_boost;
    }
    get msg() {
      return this.message ?? this.editedMessage ?? this.channelPost ?? this.editedChannelPost ?? this.businessMessage ?? this.editedBusinessMessage ?? this.callbackQuery?.message;
    }
    get chat() {
      return (this.msg ?? this.deletedBusinessMessages ?? this.messageReaction ?? this.messageReactionCount ?? this.myChatMember ?? this.chatMember ?? this.chatJoinRequest ?? this.chatBoost ?? this.removedChatBoost)?.chat;
    }
    get senderChat() {
      return this.msg?.sender_chat;
    }
    get from() {
      return (this.businessConnection ?? this.messageReaction ?? (this.chatBoost?.boost ?? this.removedChatBoost)?.source)?.user ?? (this.callbackQuery ?? this.msg ?? this.inlineQuery ?? this.chosenInlineResult ?? this.shippingQuery ?? this.preCheckoutQuery ?? this.myChatMember ?? this.chatMember ?? this.chatJoinRequest)?.from;
    }
    get msgId() {
      return this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id;
    }
    get chatId() {
      return this.chat?.id ?? this.businessConnection?.user_chat_id;
    }
    get inlineMessageId() {
      return this.callbackQuery?.inline_message_id ?? this.chosenInlineResult?.inline_message_id;
    }
    get businessConnectionId() {
      return this.msg?.business_connection_id ?? this.businessConnection?.id ?? this.deletedBusinessMessages?.business_connection_id;
    }
    entities(types) {
      const message = this.msg;
      if (message === void 0)
        return [];
      const text = message.text ?? message.caption;
      if (text === void 0)
        return [];
      let entities = message.entities ?? message.caption_entities;
      if (entities === void 0)
        return [];
      if (types !== void 0) {
        const filters = new Set(toArray(types));
        entities = entities.filter((entity) => filters.has(entity.type));
      }
      return entities.map((entity) => ({
        ...entity,
        text: text.substring(entity.offset, entity.offset + entity.length)
      }));
    }
    reactions() {
      const emoji = [];
      const emojiAdded = [];
      const emojiKept = [];
      const emojiRemoved = [];
      const customEmoji = [];
      const customEmojiAdded = [];
      const customEmojiKept = [];
      const customEmojiRemoved = [];
      const r2 = this.messageReaction;
      if (r2 !== void 0) {
        const { old_reaction, new_reaction } = r2;
        for (const reaction of new_reaction) {
          if (reaction.type === "emoji") {
            emoji.push(reaction.emoji);
          } else if (reaction.type === "custom_emoji") {
            customEmoji.push(reaction.custom_emoji_id);
          }
        }
        for (const reaction of old_reaction) {
          if (reaction.type === "emoji") {
            emojiRemoved.push(reaction.emoji);
          } else if (reaction.type === "custom_emoji") {
            customEmojiRemoved.push(reaction.custom_emoji_id);
          }
        }
        emojiAdded.push(...emoji);
        customEmojiAdded.push(...customEmoji);
        for (let i2 = 0; i2 < emojiRemoved.length; i2++) {
          const len = emojiAdded.length;
          if (len === 0)
            break;
          const rem = emojiRemoved[i2];
          for (let j2 = 0; j2 < len; j2++) {
            if (rem === emojiAdded[j2]) {
              emojiKept.push(rem);
              emojiRemoved.splice(i2, 1);
              emojiAdded.splice(j2, 1);
              i2--;
              break;
            }
          }
        }
        for (let i2 = 0; i2 < customEmojiRemoved.length; i2++) {
          const len = customEmojiAdded.length;
          if (len === 0)
            break;
          const rem = customEmojiRemoved[i2];
          for (let j2 = 0; j2 < len; j2++) {
            if (rem === customEmojiAdded[j2]) {
              customEmojiKept.push(rem);
              customEmojiRemoved.splice(i2, 1);
              customEmojiAdded.splice(j2, 1);
              i2--;
              break;
            }
          }
        }
      }
      return {
        emoji,
        emojiAdded,
        emojiKept,
        emojiRemoved,
        customEmoji,
        customEmojiAdded,
        customEmojiKept,
        customEmojiRemoved
      };
    }
    has(filter) {
      return _Context.has.filterQuery(filter)(this);
    }
    hasText(trigger) {
      return _Context.has.text(trigger)(this);
    }
    hasCommand(command) {
      return _Context.has.command(command)(this);
    }
    hasReaction(reaction) {
      return _Context.has.reaction(reaction)(this);
    }
    hasChatType(chatType) {
      return _Context.has.chatType(chatType)(this);
    }
    hasCallbackQuery(trigger) {
      return _Context.has.callbackQuery(trigger)(this);
    }
    hasGameQuery(trigger) {
      return _Context.has.gameQuery(trigger)(this);
    }
    hasInlineQuery(trigger) {
      return _Context.has.inlineQuery(trigger)(this);
    }
    hasChosenInlineResult(trigger) {
      return _Context.has.chosenInlineResult(trigger)(this);
    }
    hasPreCheckoutQuery(trigger) {
      return _Context.has.preCheckoutQuery(trigger)(this);
    }
    hasShippingQuery(trigger) {
      return _Context.has.shippingQuery(trigger)(this);
    }
    reply(text, other, signal) {
      return this.api.sendMessage(orThrow(this.chatId, "sendMessage"), text, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    forwardMessage(chat_id, other, signal) {
      return this.api.forwardMessage(chat_id, orThrow(this.chatId, "forwardMessage"), orThrow(this.msgId, "forwardMessage"), other, signal);
    }
    forwardMessages(chat_id, message_ids, other, signal) {
      return this.api.forwardMessages(chat_id, orThrow(this.chatId, "forwardMessages"), message_ids, other, signal);
    }
    copyMessage(chat_id, other, signal) {
      return this.api.copyMessage(chat_id, orThrow(this.chatId, "copyMessage"), orThrow(this.msgId, "copyMessage"), other, signal);
    }
    copyMessages(chat_id, message_ids, other, signal) {
      return this.api.copyMessages(chat_id, orThrow(this.chatId, "copyMessages"), message_ids, other, signal);
    }
    replyWithPhoto(photo, other, signal) {
      return this.api.sendPhoto(orThrow(this.chatId, "sendPhoto"), photo, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithAudio(audio, other, signal) {
      return this.api.sendAudio(orThrow(this.chatId, "sendAudio"), audio, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithDocument(document1, other, signal) {
      return this.api.sendDocument(orThrow(this.chatId, "sendDocument"), document1, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithVideo(video, other, signal) {
      return this.api.sendVideo(orThrow(this.chatId, "sendVideo"), video, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithAnimation(animation, other, signal) {
      return this.api.sendAnimation(orThrow(this.chatId, "sendAnimation"), animation, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithVoice(voice, other, signal) {
      return this.api.sendVoice(orThrow(this.chatId, "sendVoice"), voice, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithVideoNote(video_note, other, signal) {
      return this.api.sendVideoNote(orThrow(this.chatId, "sendVideoNote"), video_note, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithMediaGroup(media, other, signal) {
      return this.api.sendMediaGroup(orThrow(this.chatId, "sendMediaGroup"), media, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithLocation(latitude, longitude, other, signal) {
      return this.api.sendLocation(orThrow(this.chatId, "sendLocation"), latitude, longitude, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    editMessageLiveLocation(latitude, longitude, other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.editMessageLiveLocationInline(inlineId, latitude, longitude, other) : this.api.editMessageLiveLocation(orThrow(this.chatId, "editMessageLiveLocation"), orThrow(this.msgId, "editMessageLiveLocation"), latitude, longitude, other, signal);
    }
    stopMessageLiveLocation(other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.stopMessageLiveLocationInline(inlineId, other) : this.api.stopMessageLiveLocation(orThrow(this.chatId, "stopMessageLiveLocation"), orThrow(this.msgId, "stopMessageLiveLocation"), other, signal);
    }
    sendPaidMedia(star_count, media, other, signal) {
      return this.api.sendPaidMedia(orThrow(this.chatId, "sendPaidMedia"), star_count, media, other, signal);
    }
    replyWithVenue(latitude, longitude, title2, address, other, signal) {
      return this.api.sendVenue(orThrow(this.chatId, "sendVenue"), latitude, longitude, title2, address, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithContact(phone_number, first_name, other, signal) {
      return this.api.sendContact(orThrow(this.chatId, "sendContact"), phone_number, first_name, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithPoll(question, options, other, signal) {
      return this.api.sendPoll(orThrow(this.chatId, "sendPoll"), question, options, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithDice(emoji, other, signal) {
      return this.api.sendDice(orThrow(this.chatId, "sendDice"), emoji, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    replyWithChatAction(action, other, signal) {
      return this.api.sendChatAction(orThrow(this.chatId, "sendChatAction"), action, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    react(reaction, other, signal) {
      return this.api.setMessageReaction(orThrow(this.chatId, "setMessageReaction"), orThrow(this.msgId, "setMessageReaction"), typeof reaction === "string" ? [
        {
          type: "emoji",
          emoji: reaction
        }
      ] : (Array.isArray(reaction) ? reaction : [
        reaction
      ]).map((emoji) => typeof emoji === "string" ? {
        type: "emoji",
        emoji
      } : emoji), other, signal);
    }
    getUserProfilePhotos(other, signal) {
      return this.api.getUserProfilePhotos(orThrow(this.from, "getUserProfilePhotos").id, other, signal);
    }
    getUserChatBoosts(chat_id, signal) {
      return this.api.getUserChatBoosts(chat_id, orThrow(this.from, "getUserChatBoosts").id, signal);
    }
    getBusinessConnection(signal) {
      return this.api.getBusinessConnection(orThrow(this.businessConnectionId, "getBusinessConnection"), signal);
    }
    getFile(signal) {
      const m3 = orThrow(this.msg, "getFile");
      const file = m3.photo !== void 0 ? m3.photo[m3.photo.length - 1] : m3.animation ?? m3.audio ?? m3.document ?? m3.video ?? m3.video_note ?? m3.voice ?? m3.sticker;
      return this.api.getFile(orThrow(file, "getFile").file_id, signal);
    }
    kickAuthor(...args) {
      return this.banAuthor(...args);
    }
    banAuthor(other, signal) {
      return this.api.banChatMember(orThrow(this.chatId, "banAuthor"), orThrow(this.from, "banAuthor").id, other, signal);
    }
    kickChatMember(...args) {
      return this.banChatMember(...args);
    }
    banChatMember(user_id, other, signal) {
      return this.api.banChatMember(orThrow(this.chatId, "banChatMember"), user_id, other, signal);
    }
    unbanChatMember(user_id, other, signal) {
      return this.api.unbanChatMember(orThrow(this.chatId, "unbanChatMember"), user_id, other, signal);
    }
    restrictAuthor(permissions, other, signal) {
      return this.api.restrictChatMember(orThrow(this.chatId, "restrictAuthor"), orThrow(this.from, "restrictAuthor").id, permissions, other, signal);
    }
    restrictChatMember(user_id, permissions, other, signal) {
      return this.api.restrictChatMember(orThrow(this.chatId, "restrictChatMember"), user_id, permissions, other, signal);
    }
    promoteAuthor(other, signal) {
      return this.api.promoteChatMember(orThrow(this.chatId, "promoteAuthor"), orThrow(this.from, "promoteAuthor").id, other, signal);
    }
    promoteChatMember(user_id, other, signal) {
      return this.api.promoteChatMember(orThrow(this.chatId, "promoteChatMember"), user_id, other, signal);
    }
    setChatAdministratorAuthorCustomTitle(custom_title, signal) {
      return this.api.setChatAdministratorCustomTitle(orThrow(this.chatId, "setChatAdministratorAuthorCustomTitle"), orThrow(this.from, "setChatAdministratorAuthorCustomTitle").id, custom_title, signal);
    }
    setChatAdministratorCustomTitle(user_id, custom_title, signal) {
      return this.api.setChatAdministratorCustomTitle(orThrow(this.chatId, "setChatAdministratorCustomTitle"), user_id, custom_title, signal);
    }
    banChatSenderChat(sender_chat_id, signal) {
      return this.api.banChatSenderChat(orThrow(this.chatId, "banChatSenderChat"), sender_chat_id, signal);
    }
    unbanChatSenderChat(sender_chat_id, signal) {
      return this.api.unbanChatSenderChat(orThrow(this.chatId, "unbanChatSenderChat"), sender_chat_id, signal);
    }
    setChatPermissions(permissions, other, signal) {
      return this.api.setChatPermissions(orThrow(this.chatId, "setChatPermissions"), permissions, other, signal);
    }
    exportChatInviteLink(signal) {
      return this.api.exportChatInviteLink(orThrow(this.chatId, "exportChatInviteLink"), signal);
    }
    createChatInviteLink(other, signal) {
      return this.api.createChatInviteLink(orThrow(this.chatId, "createChatInviteLink"), other, signal);
    }
    editChatInviteLink(invite_link, other, signal) {
      return this.api.editChatInviteLink(orThrow(this.chatId, "editChatInviteLink"), invite_link, other, signal);
    }
    revokeChatInviteLink(invite_link, signal) {
      return this.api.revokeChatInviteLink(orThrow(this.chatId, "editChatInviteLink"), invite_link, signal);
    }
    approveChatJoinRequest(user_id, signal) {
      return this.api.approveChatJoinRequest(orThrow(this.chatId, "approveChatJoinRequest"), user_id, signal);
    }
    declineChatJoinRequest(user_id, signal) {
      return this.api.declineChatJoinRequest(orThrow(this.chatId, "declineChatJoinRequest"), user_id, signal);
    }
    setChatPhoto(photo, signal) {
      return this.api.setChatPhoto(orThrow(this.chatId, "setChatPhoto"), photo, signal);
    }
    deleteChatPhoto(signal) {
      return this.api.deleteChatPhoto(orThrow(this.chatId, "deleteChatPhoto"), signal);
    }
    setChatTitle(title2, signal) {
      return this.api.setChatTitle(orThrow(this.chatId, "setChatTitle"), title2, signal);
    }
    setChatDescription(description, signal) {
      return this.api.setChatDescription(orThrow(this.chatId, "setChatDescription"), description, signal);
    }
    pinChatMessage(message_id, other, signal) {
      return this.api.pinChatMessage(orThrow(this.chatId, "pinChatMessage"), message_id, other, signal);
    }
    unpinChatMessage(message_id, signal) {
      return this.api.unpinChatMessage(orThrow(this.chatId, "unpinChatMessage"), message_id, signal);
    }
    unpinAllChatMessages(signal) {
      return this.api.unpinAllChatMessages(orThrow(this.chatId, "unpinAllChatMessages"), signal);
    }
    leaveChat(signal) {
      return this.api.leaveChat(orThrow(this.chatId, "leaveChat"), signal);
    }
    getChat(signal) {
      return this.api.getChat(orThrow(this.chatId, "getChat"), signal);
    }
    getChatAdministrators(signal) {
      return this.api.getChatAdministrators(orThrow(this.chatId, "getChatAdministrators"), signal);
    }
    getChatMembersCount(...args) {
      return this.getChatMemberCount(...args);
    }
    getChatMemberCount(signal) {
      return this.api.getChatMemberCount(orThrow(this.chatId, "getChatMemberCount"), signal);
    }
    getAuthor(signal) {
      return this.api.getChatMember(orThrow(this.chatId, "getAuthor"), orThrow(this.from, "getAuthor").id, signal);
    }
    getChatMember(user_id, signal) {
      return this.api.getChatMember(orThrow(this.chatId, "getChatMember"), user_id, signal);
    }
    setChatStickerSet(sticker_set_name, signal) {
      return this.api.setChatStickerSet(orThrow(this.chatId, "setChatStickerSet"), sticker_set_name, signal);
    }
    deleteChatStickerSet(signal) {
      return this.api.deleteChatStickerSet(orThrow(this.chatId, "deleteChatStickerSet"), signal);
    }
    createForumTopic(name, other, signal) {
      return this.api.createForumTopic(orThrow(this.chatId, "createForumTopic"), name, other, signal);
    }
    editForumTopic(other, signal) {
      const message = orThrow(this.msg, "editForumTopic");
      const thread = orThrow(message.message_thread_id, "editForumTopic");
      return this.api.editForumTopic(message.chat.id, thread, other, signal);
    }
    closeForumTopic(signal) {
      const message = orThrow(this.msg, "closeForumTopic");
      const thread = orThrow(message.message_thread_id, "closeForumTopic");
      return this.api.closeForumTopic(message.chat.id, thread, signal);
    }
    reopenForumTopic(signal) {
      const message = orThrow(this.msg, "reopenForumTopic");
      const thread = orThrow(message.message_thread_id, "reopenForumTopic");
      return this.api.reopenForumTopic(message.chat.id, thread, signal);
    }
    deleteForumTopic(signal) {
      const message = orThrow(this.msg, "deleteForumTopic");
      const thread = orThrow(message.message_thread_id, "deleteForumTopic");
      return this.api.deleteForumTopic(message.chat.id, thread, signal);
    }
    unpinAllForumTopicMessages(signal) {
      const message = orThrow(this.msg, "unpinAllForumTopicMessages");
      const thread = orThrow(message.message_thread_id, "unpinAllForumTopicMessages");
      return this.api.unpinAllForumTopicMessages(message.chat.id, thread, signal);
    }
    editGeneralForumTopic(name, signal) {
      return this.api.editGeneralForumTopic(orThrow(this.chatId, "editGeneralForumTopic"), name, signal);
    }
    closeGeneralForumTopic(signal) {
      return this.api.closeGeneralForumTopic(orThrow(this.chatId, "closeGeneralForumTopic"), signal);
    }
    reopenGeneralForumTopic(signal) {
      return this.api.reopenGeneralForumTopic(orThrow(this.chatId, "reopenGeneralForumTopic"), signal);
    }
    hideGeneralForumTopic(signal) {
      return this.api.hideGeneralForumTopic(orThrow(this.chatId, "hideGeneralForumTopic"), signal);
    }
    unhideGeneralForumTopic(signal) {
      return this.api.unhideGeneralForumTopic(orThrow(this.chatId, "unhideGeneralForumTopic"), signal);
    }
    unpinAllGeneralForumTopicMessages(signal) {
      return this.api.unpinAllGeneralForumTopicMessages(orThrow(this.chatId, "unpinAllGeneralForumTopicMessages"), signal);
    }
    answerCallbackQuery(other, signal) {
      return this.api.answerCallbackQuery(orThrow(this.callbackQuery, "answerCallbackQuery").id, typeof other === "string" ? {
        text: other
      } : other, signal);
    }
    setChatMenuButton(other, signal) {
      return this.api.setChatMenuButton(other, signal);
    }
    getChatMenuButton(other, signal) {
      return this.api.getChatMenuButton(other, signal);
    }
    setMyDefaultAdministratorRights(other, signal) {
      return this.api.setMyDefaultAdministratorRights(other, signal);
    }
    getMyDefaultAdministratorRights(other, signal) {
      return this.api.getMyDefaultAdministratorRights(other, signal);
    }
    editMessageText(text, other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.editMessageTextInline(inlineId, text, other) : this.api.editMessageText(orThrow(this.chatId, "editMessageText"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageText"), text, other, signal);
    }
    editMessageCaption(other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.editMessageCaptionInline(inlineId, other) : this.api.editMessageCaption(orThrow(this.chatId, "editMessageCaption"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageCaption"), other, signal);
    }
    editMessageMedia(media, other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.editMessageMediaInline(inlineId, media, other) : this.api.editMessageMedia(orThrow(this.chatId, "editMessageMedia"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageMedia"), media, other, signal);
    }
    editMessageReplyMarkup(other, signal) {
      const inlineId = this.inlineMessageId;
      return inlineId !== void 0 ? this.api.editMessageReplyMarkupInline(inlineId, other) : this.api.editMessageReplyMarkup(orThrow(this.chatId, "editMessageReplyMarkup"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "editMessageReplyMarkup"), other, signal);
    }
    stopPoll(other, signal) {
      return this.api.stopPoll(orThrow(this.chatId, "stopPoll"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "stopPoll"), other, signal);
    }
    deleteMessage(signal) {
      return this.api.deleteMessage(orThrow(this.chatId, "deleteMessage"), orThrow(this.msg?.message_id ?? this.messageReaction?.message_id ?? this.messageReactionCount?.message_id, "deleteMessage"), signal);
    }
    deleteMessages(message_ids, signal) {
      return this.api.deleteMessages(orThrow(this.chatId, "deleteMessages"), message_ids, signal);
    }
    replyWithSticker(sticker, other, signal) {
      return this.api.sendSticker(orThrow(this.chatId, "sendSticker"), sticker, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
    getCustomEmojiStickers(signal) {
      return this.api.getCustomEmojiStickers((this.msg?.entities ?? []).filter((e2) => e2.type === "custom_emoji").map((e2) => e2.custom_emoji_id), signal);
    }
    answerInlineQuery(results, other, signal) {
      return this.api.answerInlineQuery(orThrow(this.inlineQuery, "answerInlineQuery").id, results, other, signal);
    }
    replyWithInvoice(title2, description, payload, currency, prices, other, signal) {
      return this.api.sendInvoice(orThrow(this.chatId, "sendInvoice"), title2, description, payload, currency, prices, other, signal);
    }
    answerShippingQuery(ok2, other, signal) {
      return this.api.answerShippingQuery(orThrow(this.shippingQuery, "answerShippingQuery").id, ok2, other, signal);
    }
    answerPreCheckoutQuery(ok2, other, signal) {
      return this.api.answerPreCheckoutQuery(orThrow(this.preCheckoutQuery, "answerPreCheckoutQuery").id, ok2, typeof other === "string" ? {
        error_message: other
      } : other, signal);
    }
    refundStarPayment(signal) {
      return this.api.refundStarPayment(orThrow(this.from, "refundStarPayment").id, orThrow(this.msg?.successful_payment, "refundStarPayment").telegram_payment_charge_id, signal);
    }
    setPassportDataErrors(errors, signal) {
      return this.api.setPassportDataErrors(orThrow(this.from, "setPassportDataErrors").id, errors, signal);
    }
    replyWithGame(game_short_name, other, signal) {
      return this.api.sendGame(orThrow(this.chatId, "sendGame"), game_short_name, {
        business_connection_id: this.businessConnectionId,
        ...other
      }, signal);
    }
  };
  var Context2 = _Context;
  __publicField(Context2, "has", checker);
  function orThrow(value, method) {
    if (value === void 0) {
      throw new Error(`Missing information for API call to ${method}`);
    }
    return value;
  }
  function triggerFn(trigger) {
    return toArray(trigger).map((t2) => typeof t2 === "string" ? (txt) => txt === t2 ? t2 : null : (txt) => txt.match(t2));
  }
  function match(ctx, content, triggers) {
    for (const t2 of triggers) {
      const res = t2(content);
      if (res) {
        ctx.match = res;
        return true;
      }
    }
    return false;
  }
  function toArray(e2) {
    return Array.isArray(e2) ? e2 : [
      e2
    ];
  }
  var BotError = class extends Error {
    error;
    ctx;
    constructor(error, ctx) {
      super(generateBotErrorMessage(error));
      this.error = error;
      this.ctx = ctx;
      this.name = "BotError";
      if (error instanceof Error)
        this.stack = error.stack;
    }
  };
  function generateBotErrorMessage(error) {
    let msg;
    if (error instanceof Error) {
      msg = `${error.name} in middleware: ${error.message}`;
    } else {
      const type = typeof error;
      msg = `Non-error value of type ${type} thrown in middleware`;
      switch (type) {
        case "bigint":
        case "boolean":
        case "number":
        case "symbol":
          msg += `: ${error}`;
          break;
        case "string":
          msg += `: ${String(error).substring(0, 50)}`;
          break;
        default:
          msg += "!";
          break;
      }
    }
    return msg;
  }
  function flatten(mw) {
    return typeof mw === "function" ? mw : (ctx, next) => mw.middleware()(ctx, next);
  }
  function concat1(first, andThen) {
    return async (ctx, next) => {
      let nextCalled = false;
      await first(ctx, async () => {
        if (nextCalled)
          throw new Error("`next` already called before!");
        else
          nextCalled = true;
        await andThen(ctx, next);
      });
    };
  }
  function pass(_ctx, next) {
    return next();
  }
  var leaf1 = () => Promise.resolve();
  async function run(middleware, ctx) {
    await middleware(ctx, leaf1);
  }
  var Composer = class {
    handler;
    constructor(...middleware) {
      this.handler = middleware.length === 0 ? pass : middleware.map(flatten).reduce(concat1);
    }
    middleware() {
      return this.handler;
    }
    use(...middleware) {
      const composer = new Composer(...middleware);
      this.handler = concat1(this.handler, flatten(composer));
      return composer;
    }
    on(filter, ...middleware) {
      return this.filter(Context2.has.filterQuery(filter), ...middleware);
    }
    hears(trigger, ...middleware) {
      return this.filter(Context2.has.text(trigger), ...middleware);
    }
    command(command, ...middleware) {
      return this.filter(Context2.has.command(command), ...middleware);
    }
    reaction(reaction, ...middleware) {
      return this.filter(Context2.has.reaction(reaction), ...middleware);
    }
    chatType(chatType, ...middleware) {
      return this.filter(Context2.has.chatType(chatType), ...middleware);
    }
    callbackQuery(trigger, ...middleware) {
      return this.filter(Context2.has.callbackQuery(trigger), ...middleware);
    }
    gameQuery(trigger, ...middleware) {
      return this.filter(Context2.has.gameQuery(trigger), ...middleware);
    }
    inlineQuery(trigger, ...middleware) {
      return this.filter(Context2.has.inlineQuery(trigger), ...middleware);
    }
    chosenInlineResult(resultId, ...middleware) {
      return this.filter(Context2.has.chosenInlineResult(resultId), ...middleware);
    }
    preCheckoutQuery(trigger, ...middleware) {
      return this.filter(Context2.has.preCheckoutQuery(trigger), ...middleware);
    }
    shippingQuery(trigger, ...middleware) {
      return this.filter(Context2.has.shippingQuery(trigger), ...middleware);
    }
    filter(predicate, ...middleware) {
      const composer = new Composer(...middleware);
      this.branch(predicate, composer, pass);
      return composer;
    }
    drop(predicate, ...middleware) {
      return this.filter(async (ctx) => !await predicate(ctx), ...middleware);
    }
    fork(...middleware) {
      const composer = new Composer(...middleware);
      const fork = flatten(composer);
      this.use((ctx, next) => Promise.all([
        next(),
        run(fork, ctx)
      ]));
      return composer;
    }
    lazy(middlewareFactory) {
      return this.use(async (ctx, next) => {
        const middleware = await middlewareFactory(ctx);
        const arr = Array.isArray(middleware) ? middleware : [
          middleware
        ];
        await flatten(new Composer(...arr))(ctx, next);
      });
    }
    route(router, routeHandlers, fallback = pass) {
      return this.lazy(async (ctx) => {
        const route = await router(ctx);
        return (route === void 0 || !routeHandlers[route] ? fallback : routeHandlers[route]) ?? [];
      });
    }
    branch(predicate, trueMiddleware, falseMiddleware) {
      return this.lazy(async (ctx) => await predicate(ctx) ? trueMiddleware : falseMiddleware);
    }
    errorBoundary(errorHandler2, ...middleware) {
      const composer = new Composer(...middleware);
      const bound = flatten(composer);
      this.use(async (ctx, next) => {
        let nextCalled = false;
        const cont = () => (nextCalled = true, Promise.resolve());
        try {
          await bound(ctx, cont);
        } catch (err) {
          nextCalled = false;
          await errorHandler2(new BotError(err, ctx), cont);
        }
        if (nextCalled)
          await next();
      });
      return composer;
    }
  };
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  var ms = function(val2, options) {
    options = options || {};
    var type = typeof val2;
    if (type === "string" && val2.length > 0) {
      return parse1(val2);
    } else if (type === "number" && isFinite(val2)) {
      return options.long ? fmtLong(val2) : fmtShort(val2);
    }
    throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val2));
  };
  function parse1(str2) {
    str2 = String(str2);
    if (str2.length > 100) {
      return;
    }
    var match2 = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str2);
    if (!match2) {
      return;
    }
    var n2 = parseFloat(match2[1]);
    var type = (match2[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n2 * y;
      case "weeks":
      case "week":
      case "w":
        return n2 * w;
      case "days":
      case "day":
      case "d":
        return n2 * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n2 * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n2 * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n2 * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n2;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n2, name) {
    var isPlural = msAbs >= n2 * 1.5;
    return Math.round(ms2 / n2) + " " + name + (isPlural ? "s" : "");
  }
  function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
  }
  function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  var globalContext;
  if (typeof window !== "undefined") {
    globalContext = window;
  } else if (typeof self !== "undefined") {
    globalContext = self;
  } else {
    globalContext = {};
  }
  if (typeof globalContext.setTimeout === "function") {
    cachedSetTimeout = setTimeout;
  }
  if (typeof globalContext.clearTimeout === "function") {
    cachedClearTimeout = clearTimeout;
  }
  function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
      return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
      cachedSetTimeout = setTimeout;
      return setTimeout(fun, 0);
    }
    try {
      return cachedSetTimeout(fun, 0);
    } catch (e2) {
      try {
        return cachedSetTimeout.call(null, fun, 0);
      } catch (e22) {
        return cachedSetTimeout.call(this, fun, 0);
      }
    }
  }
  function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
      return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
      cachedClearTimeout = clearTimeout;
      return clearTimeout(marker);
    }
    try {
      return cachedClearTimeout(marker);
    } catch (e2) {
      try {
        return cachedClearTimeout.call(null, marker);
      } catch (e22) {
        return cachedClearTimeout.call(this, marker);
      }
    }
  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
  }
  function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i2 = 1; i2 < arguments.length; i2++) {
        args[i2 - 1] = arguments[i2];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      runTimeout(drainQueue);
    }
  }
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  var title = "browser";
  var platform = "browser";
  var browser = true;
  var argv = [];
  var version = "";
  var versions = {};
  var release = {};
  var config = {};
  function noop() {
  }
  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;
  function binding(name) {
    throw new Error("process.binding is not supported");
  }
  function cwd() {
    return "/";
  }
  function chdir(dir) {
    throw new Error("process.chdir is not supported");
  }
  function umask() {
    return 0;
  }
  var performance = globalContext.performance || {};
  var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
    return (/* @__PURE__ */ new Date()).getTime();
  };
  function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [
      seconds,
      nanoseconds
    ];
  }
  var startTime = /* @__PURE__ */ new Date();
  function uptime() {
    var currentTime = /* @__PURE__ */ new Date();
    var dif = currentTime - startTime;
    return dif / 1e3;
  }
  var process2 = {
    nextTick,
    title,
    browser,
    env: {
      NODE_ENV: "production"
    },
    argv,
    version,
    versions,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    binding,
    cwd,
    chdir,
    umask,
    hrtime,
    platform,
    release,
    config,
    uptime
  };
  function createCommonjsModule(fn, basedir, module) {
    return module = {
      path: basedir,
      exports: {},
      require: function(path, base) {
        return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
      }
    }, fn(module, module.exports), module.exports;
  }
  function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
  }
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = ms;
    createDebug.destroy = destroy2;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i2 = 0; i2 < namespace.length; i2++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i2);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug4(...args) {
        if (!debug4.enabled) {
          return;
        }
        const self2 = debug4;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match2, format) => {
          if (match2 === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val2 = args[index];
            match2 = formatter.call(self2, val2);
            args.splice(index, 1);
            index--;
          }
          return match2;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug4.namespace = namespace;
      debug4.useColors = createDebug.useColors();
      debug4.color = createDebug.selectColor(namespace);
      debug4.extend = extend;
      debug4.destroy = createDebug.destroy;
      Object.defineProperty(debug4, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v2) => {
          enableOverride = v2;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug4);
      }
      return debug4;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i2;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i2 = 0; i2 < len; i2++) {
        if (!split[i2]) {
          continue;
        }
        namespaces = split[i2].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i2;
      let len;
      for (i2 = 0, len = createDebug.skips.length; i2 < len; i2++) {
        if (createDebug.skips[i2].test(name)) {
          return false;
        }
      }
      for (i2 = 0, len = createDebug.names.length; i2 < len; i2++) {
        if (createDebug.names[i2].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val2) {
      if (val2 instanceof Error) {
        return val2.stack || val2.message;
      }
      return val2;
    }
    function destroy2() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  var common = setup;
  var browser$1 = createCommonjsModule(function(module, exports) {
    exports.formatArgs = formatArgs2;
    exports.save = save2;
    exports.load = load2;
    exports.useColors = useColors2;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors2() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && "Cloudflare-Workers" && "Cloudflare-Workers".toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs2(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match2) => {
        if (match2 === "%%") {
          return;
        }
        index++;
        if (match2 === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save2(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load2() {
      let r2;
      try {
        r2 = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r2 && typeof process2 !== "undefined" && "env" in process2) {
        r2 = process2.env.DEBUG;
      }
      return r2;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = common(exports);
    const { formatters } = module.exports;
    formatters.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  });
  browser$1.colors;
  browser$1.destroy;
  browser$1.formatArgs;
  browser$1.load;
  browser$1.log;
  browser$1.save;
  browser$1.storage;
  browser$1.useColors;
  var itrToStream = (itr) => {
    const it = itr[Symbol.asyncIterator]();
    return new ReadableStream({
      async pull(controller) {
        const chunk = await it.next();
        if (chunk.done)
          controller.close();
        else
          controller.enqueue(chunk.value);
      }
    });
  };
  var baseFetchConfig = (_apiRoot) => ({});
  var defaultAdapter = "cloudflare";
  var debug = browser$1("grammy:warn");
  var GrammyError = class extends Error {
    method;
    payload;
    ok;
    error_code;
    description;
    parameters;
    constructor(message, err, method, payload) {
      super(`${message} (${err.error_code}: ${err.description})`);
      this.method = method;
      this.payload = payload;
      this.ok = false;
      this.name = "GrammyError";
      this.error_code = err.error_code;
      this.description = err.description;
      this.parameters = err.parameters ?? {};
    }
  };
  function toGrammyError(err, method, payload) {
    switch (err.error_code) {
      case 401:
        debug("Error 401 means that your bot token is wrong, talk to https://t.me/BotFather to check it.");
        break;
      case 409:
        debug("Error 409 means that you are running your bot several times on long polling. Consider revoking the bot token if you believe that no other instance is running.");
        break;
    }
    return new GrammyError(`Call to '${method}' failed!`, err, method, payload);
  }
  var HttpError = class extends Error {
    error;
    constructor(message, error) {
      super(message);
      this.error = error;
      this.name = "HttpError";
    }
  };
  function isTelegramError(err) {
    return typeof err === "object" && err !== null && "status" in err && "statusText" in err;
  }
  function toHttpError(method, sensitiveLogs) {
    return (err) => {
      let msg = `Network request for '${method}' failed!`;
      if (isTelegramError(err))
        msg += ` (${err.status}: ${err.statusText})`;
      if (sensitiveLogs && err instanceof Error)
        msg += ` ${err.message}`;
      throw new HttpError(msg, err);
    };
  }
  var osType = (() => {
    const { Deno } = globalThis;
    if (typeof Deno?.build?.os === "string") {
      return Deno.build.os;
    }
    const { navigator: navigator1 } = globalThis;
    if (navigator1?.appVersion?.includes?.("Win")) {
      return "windows";
    }
    return "linux";
  })();
  var isWindows = osType === "windows";
  function assertPath(path) {
    if (typeof path !== "string") {
      throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
  }
  function stripSuffix(name, suffix) {
    if (suffix.length >= name.length) {
      return name;
    }
    const lenDiff = name.length - suffix.length;
    for (let i2 = suffix.length - 1; i2 >= 0; --i2) {
      if (name.charCodeAt(lenDiff + i2) !== suffix.charCodeAt(i2)) {
        return name;
      }
    }
    return name.slice(0, -suffix.length);
  }
  function lastPathSegment(path, isSep, start = 0) {
    let matchedNonSeparator = false;
    let end = path.length;
    for (let i2 = path.length - 1; i2 >= start; --i2) {
      if (isSep(path.charCodeAt(i2))) {
        if (matchedNonSeparator) {
          start = i2 + 1;
          break;
        }
      } else if (!matchedNonSeparator) {
        matchedNonSeparator = true;
        end = i2 + 1;
      }
    }
    return path.slice(start, end);
  }
  function assertArgs(path, suffix) {
    assertPath(path);
    if (path.length === 0)
      return path;
    if (typeof suffix !== "string") {
      throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
    }
  }
  function stripTrailingSeparators(segment, isSep) {
    if (segment.length <= 1) {
      return segment;
    }
    let end = segment.length;
    for (let i2 = segment.length - 1; i2 > 0; i2--) {
      if (isSep(segment.charCodeAt(i2))) {
        end = i2;
      } else {
        break;
      }
    }
    return segment.slice(0, end);
  }
  function isPosixPathSeparator(code) {
    return code === 47;
  }
  function basename(path, suffix = "") {
    assertArgs(path, suffix);
    const lastSegment = lastPathSegment(path, isPosixPathSeparator);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
  }
  function isPathSeparator(code) {
    return code === 47 || code === 92;
  }
  function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
  }
  function basename1(path, suffix = "") {
    assertArgs(path, suffix);
    let start = 0;
    if (path.length >= 2) {
      const drive = path.charCodeAt(0);
      if (isWindowsDeviceRoot(drive)) {
        if (path.charCodeAt(1) === 58)
          start = 2;
      }
    }
    const lastSegment = lastPathSegment(path, isPathSeparator, start);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
  }
  function basename2(path, suffix = "") {
    return isWindows ? basename1(path, suffix) : basename(path, suffix);
  }
  var InputFile = class {
    consumed = false;
    fileData;
    filename;
    constructor(file, filename) {
      this.fileData = file;
      filename ??= this.guessFilename(file);
      this.filename = filename;
    }
    guessFilename(file) {
      if (typeof file === "string")
        return basename2(file);
      if (typeof file !== "object")
        return void 0;
      if ("url" in file)
        return basename2(file.url);
      if (!(file instanceof URL))
        return void 0;
      return basename2(file.pathname) || basename2(file.hostname);
    }
    toRaw() {
      if (this.consumed) {
        throw new Error("Cannot reuse InputFile data source!");
      }
      const data = this.fileData;
      if (data instanceof Blob)
        return data.stream();
      if (data instanceof URL)
        return fetchFile(data);
      if ("url" in data)
        return fetchFile(data.url);
      if (!(data instanceof Uint8Array))
        this.consumed = true;
      return data;
    }
  };
  async function* fetchFile(url) {
    const { body } = await fetch(url);
    if (body === null) {
      throw new Error(`Download failed, no response body from '${url}'`);
    }
    yield* body;
  }
  function requiresFormDataUpload(payload) {
    return payload instanceof InputFile || typeof payload === "object" && payload !== null && Object.values(payload).some((v2) => Array.isArray(v2) ? v2.some(requiresFormDataUpload) : v2 instanceof InputFile || requiresFormDataUpload(v2));
  }
  function str(value) {
    return JSON.stringify(value, (_, v2) => v2 ?? void 0);
  }
  function createJsonPayload(payload) {
    return {
      method: "POST",
      headers: {
        "content-type": "application/json",
        connection: "keep-alive"
      },
      body: str(payload)
    };
  }
  async function* protectItr(itr, onError) {
    try {
      yield* itr;
    } catch (err) {
      onError(err);
    }
  }
  function createFormDataPayload(payload, onError) {
    const boundary = createBoundary();
    const itr = payloadToMultipartItr(payload, boundary);
    const safeItr = protectItr(itr, onError);
    const stream = itrToStream(safeItr);
    return {
      method: "POST",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
        connection: "keep-alive"
      },
      body: stream
    };
  }
  function createBoundary() {
    return "----------" + randomId(32);
  }
  function randomId(length = 16) {
    return Array.from(Array(length)).map(() => Math.random().toString(36)[2] || 0).join("");
  }
  var enc = new TextEncoder();
  async function* payloadToMultipartItr(payload, boundary) {
    const files = extractFiles(payload);
    yield enc.encode(`--${boundary}\r
`);
    const separator = enc.encode(`\r
--${boundary}\r
`);
    let first = true;
    for (const [key, value] of Object.entries(payload)) {
      if (value == null)
        continue;
      if (!first)
        yield separator;
      yield valuePart(key, typeof value === "object" ? str(value) : value);
      first = false;
    }
    for (const { id, origin, file } of files) {
      if (!first)
        yield separator;
      yield* filePart(id, origin, file);
      first = false;
    }
    yield enc.encode(`\r
--${boundary}--\r
`);
  }
  function extractFiles(value) {
    if (typeof value !== "object" || value === null)
      return [];
    return Object.entries(value).flatMap(([k2, v2]) => {
      if (Array.isArray(v2))
        return v2.flatMap((p2) => extractFiles(p2));
      else if (v2 instanceof InputFile) {
        const id = randomId();
        Object.assign(value, {
          [k2]: `attach://${id}`
        });
        const origin = k2 === "media" && "type" in value && typeof value.type === "string" ? value.type : k2;
        return {
          id,
          origin,
          file: v2
        };
      } else
        return extractFiles(v2);
    });
  }
  function valuePart(key, value) {
    return enc.encode(`content-disposition:form-data;name="${key}"\r
\r
${value}`);
  }
  async function* filePart(id, origin, input) {
    const filename = input.filename || `${origin}.${getExt(origin)}`;
    if (filename.includes("\r") || filename.includes("\n")) {
      throw new Error(`File paths cannot contain carriage-return (\\r) or newline (\\n) characters! Filename for property '${origin}' was:
"""
${filename}
"""`);
    }
    yield enc.encode(`content-disposition:form-data;name="${id}";filename=${filename}\r
content-type:application/octet-stream\r
\r
`);
    const data = await input.toRaw();
    if (data instanceof Uint8Array)
      yield data;
    else
      yield* data;
  }
  function getExt(key) {
    switch (key) {
      case "certificate":
        return "pem";
      case "photo":
      case "thumbnail":
        return "jpg";
      case "voice":
        return "ogg";
      case "audio":
        return "mp3";
      case "animation":
      case "video":
      case "video_note":
        return "mp4";
      case "sticker":
        return "webp";
      default:
        return "dat";
    }
  }
  var debug1 = browser$1("grammy:core");
  function concatTransformer(prev, trans) {
    return (method, payload, signal) => trans(prev, method, payload, signal);
  }
  var ApiClient = class {
    token;
    webhookReplyEnvelope;
    options;
    hasUsedWebhookReply;
    installedTransformers;
    constructor(token, options = {}, webhookReplyEnvelope = {}) {
      this.token = token;
      this.webhookReplyEnvelope = webhookReplyEnvelope;
      this.hasUsedWebhookReply = false;
      this.installedTransformers = [];
      this.call = async (method, p2, signal) => {
        const payload = p2 ?? {};
        debug1(`Calling ${method}`);
        if (signal !== void 0)
          validateSignal(method, payload, signal);
        const opts = this.options;
        const formDataRequired = requiresFormDataUpload(payload);
        if (this.webhookReplyEnvelope.send !== void 0 && !this.hasUsedWebhookReply && !formDataRequired && opts.canUseWebhookReply(method)) {
          this.hasUsedWebhookReply = true;
          const config3 = createJsonPayload({
            ...payload,
            method
          });
          await this.webhookReplyEnvelope.send(config3.body);
          return {
            ok: true,
            result: true
          };
        }
        const controller = createAbortControllerFromSignal(signal);
        const timeout = createTimeout(controller, opts.timeoutSeconds, method);
        const streamErr = createStreamError(controller);
        const url = opts.buildUrl(opts.apiRoot, this.token, method, opts.environment);
        const config2 = formDataRequired ? createFormDataPayload(payload, (err) => streamErr.catch(err)) : createJsonPayload(payload);
        const sig = controller.signal;
        const options2 = {
          ...opts.baseFetchConfig,
          signal: sig,
          ...config2
        };
        const successPromise = fetch(url instanceof URL ? url.href : url, options2).catch(toHttpError(method, opts.sensitiveLogs));
        const operations = [
          successPromise,
          streamErr.promise,
          timeout.promise
        ];
        try {
          const res = await Promise.race(operations);
          return await res.json();
        } finally {
          if (timeout.handle !== void 0)
            clearTimeout(timeout.handle);
        }
      };
      const apiRoot = options.apiRoot ?? "https://api.telegram.org";
      const environment = options.environment ?? "prod";
      this.options = {
        apiRoot,
        environment,
        buildUrl: options.buildUrl ?? defaultBuildUrl,
        timeoutSeconds: options.timeoutSeconds ?? 500,
        baseFetchConfig: {
          ...baseFetchConfig(apiRoot),
          ...options.baseFetchConfig
        },
        canUseWebhookReply: options.canUseWebhookReply ?? (() => false),
        sensitiveLogs: options.sensitiveLogs ?? false
      };
      if (this.options.apiRoot.endsWith("/")) {
        throw new Error(`Remove the trailing '/' from the 'apiRoot' option (use '${this.options.apiRoot.substring(0, this.options.apiRoot.length - 1)}' instead of '${this.options.apiRoot}')`);
      }
    }
    call;
    use(...transformers) {
      this.call = transformers.reduce(concatTransformer, this.call);
      this.installedTransformers.push(...transformers);
      return this;
    }
    async callApi(method, payload, signal) {
      const data = await this.call(method, payload, signal);
      if (data.ok)
        return data.result;
      else
        throw toGrammyError(data, method, payload);
    }
  };
  function createRawApi(token, options, webhookReplyEnvelope) {
    const client = new ApiClient(token, options, webhookReplyEnvelope);
    const proxyHandler = {
      get(_, m3) {
        return m3 === "toJSON" ? "__internal" : client.callApi.bind(client, m3);
      },
      ...proxyMethods
    };
    const raw2 = new Proxy({}, proxyHandler);
    const installedTransformers = client.installedTransformers;
    const api = {
      raw: raw2,
      installedTransformers,
      use: (...t2) => {
        client.use(...t2);
        return api;
      }
    };
    return api;
  }
  var defaultBuildUrl = (root, token, method, env) => {
    const prefix = env === "test" ? "test/" : "";
    return `${root}/bot${token}/${prefix}${method}`;
  };
  var proxyMethods = {
    set() {
      return false;
    },
    defineProperty() {
      return false;
    },
    deleteProperty() {
      return false;
    },
    ownKeys() {
      return [];
    }
  };
  function createTimeout(controller, seconds, method) {
    let handle = void 0;
    const promise = new Promise((_, reject) => {
      handle = setTimeout(() => {
        const msg = `Request to '${method}' timed out after ${seconds} seconds`;
        reject(new Error(msg));
        controller.abort();
      }, 1e3 * seconds);
    });
    return {
      promise,
      handle
    };
  }
  function createStreamError(abortController) {
    let onError = (err) => {
      throw err;
    };
    const promise = new Promise((_, reject) => {
      onError = (err) => {
        reject(err);
        abortController.abort();
      };
    });
    return {
      promise,
      catch: onError
    };
  }
  function createAbortControllerFromSignal(signal) {
    const abortController = new AbortController();
    if (signal === void 0)
      return abortController;
    const sig = signal;
    function abort() {
      abortController.abort();
      sig.removeEventListener("abort", abort);
    }
    if (sig.aborted)
      abort();
    else
      sig.addEventListener("abort", abort);
    return {
      abort,
      signal: abortController.signal
    };
  }
  function validateSignal(method, payload, signal) {
    if (typeof signal?.addEventListener === "function") {
      return;
    }
    let payload0 = JSON.stringify(payload);
    if (payload0.length > 20) {
      payload0 = payload0.substring(0, 16) + " ...";
    }
    let payload1 = JSON.stringify(signal);
    if (payload1.length > 20) {
      payload1 = payload1.substring(0, 16) + " ...";
    }
    throw new Error(`Incorrect abort signal instance found! You passed two payloads to '${method}' but you should merge the second one containing '${payload1}' into the first one containing '${payload0}'! If you are using context shortcuts, you may want to use a method on 'ctx.api' instead.

If you want to prevent such mistakes in the future, consider using TypeScript. https://www.typescriptlang.org/`);
  }
  var Api = class {
    token;
    options;
    raw;
    config;
    constructor(token, options, webhookReplyEnvelope) {
      this.token = token;
      this.options = options;
      const { raw: raw2, use, installedTransformers } = createRawApi(token, options, webhookReplyEnvelope);
      this.raw = raw2;
      this.config = {
        use,
        installedTransformers: () => installedTransformers.slice()
      };
    }
    getUpdates(other, signal) {
      return this.raw.getUpdates({
        ...other
      }, signal);
    }
    setWebhook(url, other, signal) {
      return this.raw.setWebhook({
        url,
        ...other
      }, signal);
    }
    deleteWebhook(other, signal) {
      return this.raw.deleteWebhook({
        ...other
      }, signal);
    }
    getWebhookInfo(signal) {
      return this.raw.getWebhookInfo(signal);
    }
    getMe(signal) {
      return this.raw.getMe(signal);
    }
    logOut(signal) {
      return this.raw.logOut(signal);
    }
    close(signal) {
      return this.raw.close(signal);
    }
    sendMessage(chat_id, text, other, signal) {
      return this.raw.sendMessage({
        chat_id,
        text,
        ...other
      }, signal);
    }
    forwardMessage(chat_id, from_chat_id, message_id, other, signal) {
      return this.raw.forwardMessage({
        chat_id,
        from_chat_id,
        message_id,
        ...other
      }, signal);
    }
    forwardMessages(chat_id, from_chat_id, message_ids, other, signal) {
      return this.raw.forwardMessages({
        chat_id,
        from_chat_id,
        message_ids,
        ...other
      }, signal);
    }
    copyMessage(chat_id, from_chat_id, message_id, other, signal) {
      return this.raw.copyMessage({
        chat_id,
        from_chat_id,
        message_id,
        ...other
      }, signal);
    }
    copyMessages(chat_id, from_chat_id, message_ids, other, signal) {
      return this.raw.copyMessages({
        chat_id,
        from_chat_id,
        message_ids,
        ...other
      }, signal);
    }
    sendPhoto(chat_id, photo, other, signal) {
      return this.raw.sendPhoto({
        chat_id,
        photo,
        ...other
      }, signal);
    }
    sendAudio(chat_id, audio, other, signal) {
      return this.raw.sendAudio({
        chat_id,
        audio,
        ...other
      }, signal);
    }
    sendDocument(chat_id, document1, other, signal) {
      return this.raw.sendDocument({
        chat_id,
        document: document1,
        ...other
      }, signal);
    }
    sendVideo(chat_id, video, other, signal) {
      return this.raw.sendVideo({
        chat_id,
        video,
        ...other
      }, signal);
    }
    sendAnimation(chat_id, animation, other, signal) {
      return this.raw.sendAnimation({
        chat_id,
        animation,
        ...other
      }, signal);
    }
    sendVoice(chat_id, voice, other, signal) {
      return this.raw.sendVoice({
        chat_id,
        voice,
        ...other
      }, signal);
    }
    sendVideoNote(chat_id, video_note, other, signal) {
      return this.raw.sendVideoNote({
        chat_id,
        video_note,
        ...other
      }, signal);
    }
    sendMediaGroup(chat_id, media, other, signal) {
      return this.raw.sendMediaGroup({
        chat_id,
        media,
        ...other
      }, signal);
    }
    sendLocation(chat_id, latitude, longitude, other, signal) {
      return this.raw.sendLocation({
        chat_id,
        latitude,
        longitude,
        ...other
      }, signal);
    }
    editMessageLiveLocation(chat_id, message_id, latitude, longitude, other, signal) {
      return this.raw.editMessageLiveLocation({
        chat_id,
        message_id,
        latitude,
        longitude,
        ...other
      }, signal);
    }
    editMessageLiveLocationInline(inline_message_id, latitude, longitude, other, signal) {
      return this.raw.editMessageLiveLocation({
        inline_message_id,
        latitude,
        longitude,
        ...other
      }, signal);
    }
    stopMessageLiveLocation(chat_id, message_id, other, signal) {
      return this.raw.stopMessageLiveLocation({
        chat_id,
        message_id,
        ...other
      }, signal);
    }
    stopMessageLiveLocationInline(inline_message_id, other, signal) {
      return this.raw.stopMessageLiveLocation({
        inline_message_id,
        ...other
      }, signal);
    }
    sendPaidMedia(chat_id, star_count, media, other, signal) {
      return this.raw.sendPaidMedia({
        chat_id,
        star_count,
        media,
        ...other
      }, signal);
    }
    sendVenue(chat_id, latitude, longitude, title2, address, other, signal) {
      return this.raw.sendVenue({
        chat_id,
        latitude,
        longitude,
        title: title2,
        address,
        ...other
      }, signal);
    }
    sendContact(chat_id, phone_number, first_name, other, signal) {
      return this.raw.sendContact({
        chat_id,
        phone_number,
        first_name,
        ...other
      }, signal);
    }
    sendPoll(chat_id, question, options, other, signal) {
      return this.raw.sendPoll({
        chat_id,
        question,
        options,
        ...other
      }, signal);
    }
    sendDice(chat_id, emoji, other, signal) {
      return this.raw.sendDice({
        chat_id,
        emoji,
        ...other
      }, signal);
    }
    setMessageReaction(chat_id, message_id, reaction, other, signal) {
      return this.raw.setMessageReaction({
        chat_id,
        message_id,
        reaction,
        ...other
      }, signal);
    }
    sendChatAction(chat_id, action, other, signal) {
      return this.raw.sendChatAction({
        chat_id,
        action,
        ...other
      }, signal);
    }
    getUserProfilePhotos(user_id, other, signal) {
      return this.raw.getUserProfilePhotos({
        user_id,
        ...other
      }, signal);
    }
    getUserChatBoosts(chat_id, user_id, signal) {
      return this.raw.getUserChatBoosts({
        chat_id,
        user_id
      }, signal);
    }
    getBusinessConnection(business_connection_id, signal) {
      return this.raw.getBusinessConnection({
        business_connection_id
      }, signal);
    }
    getFile(file_id, signal) {
      return this.raw.getFile({
        file_id
      }, signal);
    }
    kickChatMember(...args) {
      return this.banChatMember(...args);
    }
    banChatMember(chat_id, user_id, other, signal) {
      return this.raw.banChatMember({
        chat_id,
        user_id,
        ...other
      }, signal);
    }
    unbanChatMember(chat_id, user_id, other, signal) {
      return this.raw.unbanChatMember({
        chat_id,
        user_id,
        ...other
      }, signal);
    }
    restrictChatMember(chat_id, user_id, permissions, other, signal) {
      return this.raw.restrictChatMember({
        chat_id,
        user_id,
        permissions,
        ...other
      }, signal);
    }
    promoteChatMember(chat_id, user_id, other, signal) {
      return this.raw.promoteChatMember({
        chat_id,
        user_id,
        ...other
      }, signal);
    }
    setChatAdministratorCustomTitle(chat_id, user_id, custom_title, signal) {
      return this.raw.setChatAdministratorCustomTitle({
        chat_id,
        user_id,
        custom_title
      }, signal);
    }
    banChatSenderChat(chat_id, sender_chat_id, signal) {
      return this.raw.banChatSenderChat({
        chat_id,
        sender_chat_id
      }, signal);
    }
    unbanChatSenderChat(chat_id, sender_chat_id, signal) {
      return this.raw.unbanChatSenderChat({
        chat_id,
        sender_chat_id
      }, signal);
    }
    setChatPermissions(chat_id, permissions, other, signal) {
      return this.raw.setChatPermissions({
        chat_id,
        permissions,
        ...other
      }, signal);
    }
    exportChatInviteLink(chat_id, signal) {
      return this.raw.exportChatInviteLink({
        chat_id
      }, signal);
    }
    createChatInviteLink(chat_id, other, signal) {
      return this.raw.createChatInviteLink({
        chat_id,
        ...other
      }, signal);
    }
    editChatInviteLink(chat_id, invite_link, other, signal) {
      return this.raw.editChatInviteLink({
        chat_id,
        invite_link,
        ...other
      }, signal);
    }
    revokeChatInviteLink(chat_id, invite_link, signal) {
      return this.raw.revokeChatInviteLink({
        chat_id,
        invite_link
      }, signal);
    }
    approveChatJoinRequest(chat_id, user_id, signal) {
      return this.raw.approveChatJoinRequest({
        chat_id,
        user_id
      }, signal);
    }
    declineChatJoinRequest(chat_id, user_id, signal) {
      return this.raw.declineChatJoinRequest({
        chat_id,
        user_id
      }, signal);
    }
    setChatPhoto(chat_id, photo, signal) {
      return this.raw.setChatPhoto({
        chat_id,
        photo
      }, signal);
    }
    deleteChatPhoto(chat_id, signal) {
      return this.raw.deleteChatPhoto({
        chat_id
      }, signal);
    }
    setChatTitle(chat_id, title2, signal) {
      return this.raw.setChatTitle({
        chat_id,
        title: title2
      }, signal);
    }
    setChatDescription(chat_id, description, signal) {
      return this.raw.setChatDescription({
        chat_id,
        description
      }, signal);
    }
    pinChatMessage(chat_id, message_id, other, signal) {
      return this.raw.pinChatMessage({
        chat_id,
        message_id,
        ...other
      }, signal);
    }
    unpinChatMessage(chat_id, message_id, signal) {
      return this.raw.unpinChatMessage({
        chat_id,
        message_id
      }, signal);
    }
    unpinAllChatMessages(chat_id, signal) {
      return this.raw.unpinAllChatMessages({
        chat_id
      }, signal);
    }
    leaveChat(chat_id, signal) {
      return this.raw.leaveChat({
        chat_id
      }, signal);
    }
    getChat(chat_id, signal) {
      return this.raw.getChat({
        chat_id
      }, signal);
    }
    getChatAdministrators(chat_id, signal) {
      return this.raw.getChatAdministrators({
        chat_id
      }, signal);
    }
    getChatMembersCount(...args) {
      return this.getChatMemberCount(...args);
    }
    getChatMemberCount(chat_id, signal) {
      return this.raw.getChatMemberCount({
        chat_id
      }, signal);
    }
    getChatMember(chat_id, user_id, signal) {
      return this.raw.getChatMember({
        chat_id,
        user_id
      }, signal);
    }
    setChatStickerSet(chat_id, sticker_set_name, signal) {
      return this.raw.setChatStickerSet({
        chat_id,
        sticker_set_name
      }, signal);
    }
    deleteChatStickerSet(chat_id, signal) {
      return this.raw.deleteChatStickerSet({
        chat_id
      }, signal);
    }
    getForumTopicIconStickers(signal) {
      return this.raw.getForumTopicIconStickers(signal);
    }
    createForumTopic(chat_id, name, other, signal) {
      return this.raw.createForumTopic({
        chat_id,
        name,
        ...other
      }, signal);
    }
    editForumTopic(chat_id, message_thread_id, other, signal) {
      return this.raw.editForumTopic({
        chat_id,
        message_thread_id,
        ...other
      }, signal);
    }
    closeForumTopic(chat_id, message_thread_id, signal) {
      return this.raw.closeForumTopic({
        chat_id,
        message_thread_id
      }, signal);
    }
    reopenForumTopic(chat_id, message_thread_id, signal) {
      return this.raw.reopenForumTopic({
        chat_id,
        message_thread_id
      }, signal);
    }
    deleteForumTopic(chat_id, message_thread_id, signal) {
      return this.raw.deleteForumTopic({
        chat_id,
        message_thread_id
      }, signal);
    }
    unpinAllForumTopicMessages(chat_id, message_thread_id, signal) {
      return this.raw.unpinAllForumTopicMessages({
        chat_id,
        message_thread_id
      }, signal);
    }
    editGeneralForumTopic(chat_id, name, signal) {
      return this.raw.editGeneralForumTopic({
        chat_id,
        name
      }, signal);
    }
    closeGeneralForumTopic(chat_id, signal) {
      return this.raw.closeGeneralForumTopic({
        chat_id
      }, signal);
    }
    reopenGeneralForumTopic(chat_id, signal) {
      return this.raw.reopenGeneralForumTopic({
        chat_id
      }, signal);
    }
    hideGeneralForumTopic(chat_id, signal) {
      return this.raw.hideGeneralForumTopic({
        chat_id
      }, signal);
    }
    unhideGeneralForumTopic(chat_id, signal) {
      return this.raw.unhideGeneralForumTopic({
        chat_id
      }, signal);
    }
    unpinAllGeneralForumTopicMessages(chat_id, signal) {
      return this.raw.unpinAllGeneralForumTopicMessages({
        chat_id
      }, signal);
    }
    answerCallbackQuery(callback_query_id, other, signal) {
      return this.raw.answerCallbackQuery({
        callback_query_id,
        ...other
      }, signal);
    }
    setMyName(name, other, signal) {
      return this.raw.setMyName({
        name,
        ...other
      }, signal);
    }
    getMyName(other, signal) {
      return this.raw.getMyName(other ?? {}, signal);
    }
    setMyCommands(commands, other, signal) {
      return this.raw.setMyCommands({
        commands,
        ...other
      }, signal);
    }
    deleteMyCommands(other, signal) {
      return this.raw.deleteMyCommands({
        ...other
      }, signal);
    }
    getMyCommands(other, signal) {
      return this.raw.getMyCommands({
        ...other
      }, signal);
    }
    setMyDescription(description, other, signal) {
      return this.raw.setMyDescription({
        description,
        ...other
      }, signal);
    }
    getMyDescription(other, signal) {
      return this.raw.getMyDescription({
        ...other
      }, signal);
    }
    setMyShortDescription(short_description, other, signal) {
      return this.raw.setMyShortDescription({
        short_description,
        ...other
      }, signal);
    }
    getMyShortDescription(other, signal) {
      return this.raw.getMyShortDescription({
        ...other
      }, signal);
    }
    setChatMenuButton(other, signal) {
      return this.raw.setChatMenuButton({
        ...other
      }, signal);
    }
    getChatMenuButton(other, signal) {
      return this.raw.getChatMenuButton({
        ...other
      }, signal);
    }
    setMyDefaultAdministratorRights(other, signal) {
      return this.raw.setMyDefaultAdministratorRights({
        ...other
      }, signal);
    }
    getMyDefaultAdministratorRights(other, signal) {
      return this.raw.getMyDefaultAdministratorRights({
        ...other
      }, signal);
    }
    editMessageText(chat_id, message_id, text, other, signal) {
      return this.raw.editMessageText({
        chat_id,
        message_id,
        text,
        ...other
      }, signal);
    }
    editMessageTextInline(inline_message_id, text, other, signal) {
      return this.raw.editMessageText({
        inline_message_id,
        text,
        ...other
      }, signal);
    }
    editMessageCaption(chat_id, message_id, other, signal) {
      return this.raw.editMessageCaption({
        chat_id,
        message_id,
        ...other
      }, signal);
    }
    editMessageCaptionInline(inline_message_id, other, signal) {
      return this.raw.editMessageCaption({
        inline_message_id,
        ...other
      }, signal);
    }
    editMessageMedia(chat_id, message_id, media, other, signal) {
      return this.raw.editMessageMedia({
        chat_id,
        message_id,
        media,
        ...other
      }, signal);
    }
    editMessageMediaInline(inline_message_id, media, other, signal) {
      return this.raw.editMessageMedia({
        inline_message_id,
        media,
        ...other
      }, signal);
    }
    editMessageReplyMarkup(chat_id, message_id, other, signal) {
      return this.raw.editMessageReplyMarkup({
        chat_id,
        message_id,
        ...other
      }, signal);
    }
    editMessageReplyMarkupInline(inline_message_id, other, signal) {
      return this.raw.editMessageReplyMarkup({
        inline_message_id,
        ...other
      }, signal);
    }
    stopPoll(chat_id, message_id, other, signal) {
      return this.raw.stopPoll({
        chat_id,
        message_id,
        ...other
      }, signal);
    }
    deleteMessage(chat_id, message_id, signal) {
      return this.raw.deleteMessage({
        chat_id,
        message_id
      }, signal);
    }
    deleteMessages(chat_id, message_ids, signal) {
      return this.raw.deleteMessages({
        chat_id,
        message_ids
      }, signal);
    }
    sendSticker(chat_id, sticker, other, signal) {
      return this.raw.sendSticker({
        chat_id,
        sticker,
        ...other
      }, signal);
    }
    getStickerSet(name, signal) {
      return this.raw.getStickerSet({
        name
      }, signal);
    }
    getCustomEmojiStickers(custom_emoji_ids, signal) {
      return this.raw.getCustomEmojiStickers({
        custom_emoji_ids
      }, signal);
    }
    uploadStickerFile(user_id, sticker_format, sticker, signal) {
      return this.raw.uploadStickerFile({
        user_id,
        sticker_format,
        sticker
      }, signal);
    }
    createNewStickerSet(user_id, name, title2, stickers, other, signal) {
      return this.raw.createNewStickerSet({
        user_id,
        name,
        title: title2,
        stickers,
        ...other
      }, signal);
    }
    addStickerToSet(user_id, name, sticker, signal) {
      return this.raw.addStickerToSet({
        user_id,
        name,
        sticker
      }, signal);
    }
    setStickerPositionInSet(sticker, position, signal) {
      return this.raw.setStickerPositionInSet({
        sticker,
        position
      }, signal);
    }
    deleteStickerFromSet(sticker, signal) {
      return this.raw.deleteStickerFromSet({
        sticker
      }, signal);
    }
    replaceStickerInSet(user_id, name, old_sticker, sticker, signal) {
      return this.raw.replaceStickerInSet({
        user_id,
        name,
        old_sticker,
        sticker
      }, signal);
    }
    setStickerEmojiList(sticker, emoji_list, signal) {
      return this.raw.setStickerEmojiList({
        sticker,
        emoji_list
      }, signal);
    }
    setStickerKeywords(sticker, keywords, signal) {
      return this.raw.setStickerKeywords({
        sticker,
        keywords
      }, signal);
    }
    setStickerMaskPosition(sticker, mask_position, signal) {
      return this.raw.setStickerMaskPosition({
        sticker,
        mask_position
      }, signal);
    }
    setStickerSetTitle(name, title2, signal) {
      return this.raw.setStickerSetTitle({
        name,
        title: title2
      }, signal);
    }
    deleteStickerSet(name, signal) {
      return this.raw.deleteStickerSet({
        name
      }, signal);
    }
    setStickerSetThumbnail(name, user_id, thumbnail, format, signal) {
      return this.raw.setStickerSetThumbnail({
        name,
        user_id,
        thumbnail,
        format
      }, signal);
    }
    setCustomEmojiStickerSetThumbnail(name, custom_emoji_id, signal) {
      return this.raw.setCustomEmojiStickerSetThumbnail({
        name,
        custom_emoji_id
      }, signal);
    }
    answerInlineQuery(inline_query_id, results, other, signal) {
      return this.raw.answerInlineQuery({
        inline_query_id,
        results,
        ...other
      }, signal);
    }
    answerWebAppQuery(web_app_query_id, result, signal) {
      return this.raw.answerWebAppQuery({
        web_app_query_id,
        result
      }, signal);
    }
    sendInvoice(chat_id, title2, description, payload, currency, prices, other, signal) {
      return this.raw.sendInvoice({
        chat_id,
        title: title2,
        description,
        payload,
        currency,
        prices,
        ...other
      }, signal);
    }
    createInvoiceLink(title2, description, payload, provider_token, currency, prices, other, signal) {
      return this.raw.createInvoiceLink({
        title: title2,
        description,
        payload,
        provider_token,
        currency,
        prices,
        ...other
      }, signal);
    }
    answerShippingQuery(shipping_query_id, ok2, other, signal) {
      return this.raw.answerShippingQuery({
        shipping_query_id,
        ok: ok2,
        ...other
      }, signal);
    }
    answerPreCheckoutQuery(pre_checkout_query_id, ok2, other, signal) {
      return this.raw.answerPreCheckoutQuery({
        pre_checkout_query_id,
        ok: ok2,
        ...other
      }, signal);
    }
    getStarTransactions(other, signal) {
      return this.raw.getStarTransactions({
        ...other
      }, signal);
    }
    refundStarPayment(user_id, telegram_payment_charge_id, signal) {
      return this.raw.refundStarPayment({
        user_id,
        telegram_payment_charge_id
      }, signal);
    }
    setPassportDataErrors(user_id, errors, signal) {
      return this.raw.setPassportDataErrors({
        user_id,
        errors
      }, signal);
    }
    sendGame(chat_id, game_short_name, other, signal) {
      return this.raw.sendGame({
        chat_id,
        game_short_name,
        ...other
      }, signal);
    }
    setGameScore(chat_id, message_id, user_id, score, other, signal) {
      return this.raw.setGameScore({
        chat_id,
        message_id,
        user_id,
        score,
        ...other
      }, signal);
    }
    setGameScoreInline(inline_message_id, user_id, score, other, signal) {
      return this.raw.setGameScore({
        inline_message_id,
        user_id,
        score,
        ...other
      }, signal);
    }
    getGameHighScores(chat_id, message_id, user_id, signal) {
      return this.raw.getGameHighScores({
        chat_id,
        message_id,
        user_id
      }, signal);
    }
    getGameHighScoresInline(inline_message_id, user_id, signal) {
      return this.raw.getGameHighScores({
        inline_message_id,
        user_id
      }, signal);
    }
  };
  var debug2 = browser$1("grammy:bot");
  var debugWarn = browser$1("grammy:warn");
  var debugErr = browser$1("grammy:error");
  var DEFAULT_UPDATE_TYPES = [
    "message",
    "edited_message",
    "channel_post",
    "edited_channel_post",
    "business_connection",
    "business_message",
    "edited_business_message",
    "deleted_business_messages",
    "inline_query",
    "chosen_inline_result",
    "callback_query",
    "shipping_query",
    "pre_checkout_query",
    "poll",
    "poll_answer",
    "my_chat_member",
    "chat_join_request",
    "chat_boost",
    "removed_chat_boost"
  ];
  var Bot = class extends Composer {
    token;
    pollingRunning;
    pollingAbortController;
    lastTriedUpdateId;
    api;
    me;
    mePromise;
    clientConfig;
    ContextConstructor;
    observedUpdateTypes;
    errorHandler;
    constructor(token, config2) {
      super();
      this.token = token;
      this.pollingRunning = false;
      this.lastTriedUpdateId = 0;
      this.observedUpdateTypes = /* @__PURE__ */ new Set();
      this.errorHandler = async (err) => {
        console.error("Error in middleware while handling update", err.ctx?.update?.update_id, err.error);
        console.error("No error handler was set!");
        console.error("Set your own error handler with `bot.catch = ...`");
        if (this.pollingRunning) {
          console.error("Stopping bot");
          await this.stop();
        }
        throw err;
      };
      if (!token)
        throw new Error("Empty token!");
      this.me = config2?.botInfo;
      this.clientConfig = config2?.client;
      this.ContextConstructor = config2?.ContextConstructor ?? Context2;
      this.api = new Api(token, this.clientConfig);
    }
    set botInfo(botInfo) {
      this.me = botInfo;
    }
    get botInfo() {
      if (this.me === void 0) {
        throw new Error("Bot information unavailable! Make sure to call `await bot.init()` before accessing `bot.botInfo`!");
      }
      return this.me;
    }
    on(filter, ...middleware) {
      for (const [u2] of parse(filter).flatMap(preprocess)) {
        this.observedUpdateTypes.add(u2);
      }
      return super.on(filter, ...middleware);
    }
    reaction(reaction, ...middleware) {
      this.observedUpdateTypes.add("message_reaction");
      return super.reaction(reaction, ...middleware);
    }
    isInited() {
      return this.me !== void 0;
    }
    async init(signal) {
      if (!this.isInited()) {
        debug2("Initializing bot");
        this.mePromise ??= withRetries(() => this.api.getMe(signal), signal);
        let me;
        try {
          me = await this.mePromise;
        } finally {
          this.mePromise = void 0;
        }
        if (this.me === void 0)
          this.me = me;
        else
          debug2("Bot info was set by now, will not overwrite");
      }
      debug2(`I am ${this.me.username}!`);
    }
    async handleUpdates(updates) {
      for (const update of updates) {
        this.lastTriedUpdateId = update.update_id;
        try {
          await this.handleUpdate(update);
        } catch (err) {
          if (err instanceof BotError) {
            await this.errorHandler(err);
          } else {
            console.error("FATAL: grammY unable to handle:", err);
            throw err;
          }
        }
      }
    }
    async handleUpdate(update, webhookReplyEnvelope) {
      if (this.me === void 0) {
        throw new Error("Bot not initialized! Either call `await bot.init()`, or directly set the `botInfo` option in the `Bot` constructor to specify a known bot info object.");
      }
      debug2(`Processing update ${update.update_id}`);
      const api = new Api(this.token, this.clientConfig, webhookReplyEnvelope);
      const t2 = this.api.config.installedTransformers();
      if (t2.length > 0)
        api.config.use(...t2);
      const ctx = new this.ContextConstructor(update, api, this.me);
      try {
        await run(this.middleware(), ctx);
      } catch (err) {
        debugErr(`Error in middleware for update ${update.update_id}`);
        throw new BotError(err, ctx);
      }
    }
    async start(options) {
      const setup2 = [];
      if (!this.isInited()) {
        setup2.push(this.init(this.pollingAbortController?.signal));
      }
      if (this.pollingRunning) {
        await Promise.all(setup2);
        debug2("Simple long polling already running!");
        return;
      }
      this.pollingRunning = true;
      this.pollingAbortController = new AbortController();
      try {
        setup2.push(withRetries(async () => {
          await this.api.deleteWebhook({
            drop_pending_updates: options?.drop_pending_updates
          }, this.pollingAbortController?.signal);
        }, this.pollingAbortController?.signal));
        await Promise.all(setup2);
        await options?.onStart?.(this.botInfo);
      } catch (err) {
        this.pollingRunning = false;
        this.pollingAbortController = void 0;
        throw err;
      }
      if (!this.pollingRunning)
        return;
      validateAllowedUpdates(this.observedUpdateTypes, options?.allowed_updates);
      this.use = noUseFunction;
      debug2("Starting simple long polling");
      await this.loop(options);
      debug2("Middleware is done running");
    }
    async stop() {
      if (this.pollingRunning) {
        debug2("Stopping bot, saving update offset");
        this.pollingRunning = false;
        this.pollingAbortController?.abort();
        const offset = this.lastTriedUpdateId + 1;
        await this.api.getUpdates({
          offset,
          limit: 1
        }).finally(() => this.pollingAbortController = void 0);
      } else {
        debug2("Bot is not running!");
      }
    }
    catch(errorHandler2) {
      this.errorHandler = errorHandler2;
    }
    async loop(options) {
      const limit = options?.limit;
      const timeout = options?.timeout ?? 30;
      let allowed_updates = options?.allowed_updates ?? [];
      while (this.pollingRunning) {
        const updates = await this.fetchUpdates({
          limit,
          timeout,
          allowed_updates
        });
        if (updates === void 0)
          break;
        await this.handleUpdates(updates);
        allowed_updates = void 0;
      }
    }
    async fetchUpdates({ limit, timeout, allowed_updates }) {
      const offset = this.lastTriedUpdateId + 1;
      let updates = void 0;
      do {
        try {
          updates = await this.api.getUpdates({
            offset,
            limit,
            timeout,
            allowed_updates
          }, this.pollingAbortController?.signal);
        } catch (error) {
          await this.handlePollingError(error);
        }
      } while (updates === void 0 && this.pollingRunning);
      return updates;
    }
    async handlePollingError(error) {
      if (!this.pollingRunning) {
        debug2("Pending getUpdates request cancelled");
        return;
      }
      let sleepSeconds = 3;
      if (error instanceof GrammyError) {
        debugErr(error.message);
        if (error.error_code === 401 || error.error_code === 409) {
          throw error;
        } else if (error.error_code === 429) {
          debugErr("Bot API server is closing.");
          sleepSeconds = error.parameters.retry_after ?? sleepSeconds;
        }
      } else
        debugErr(error);
      debugErr(`Call to getUpdates failed, retrying in ${sleepSeconds} seconds ...`);
      await sleep(sleepSeconds);
    }
  };
  async function withRetries(task, signal) {
    const INITIAL_DELAY = 50;
    let lastDelay = 50;
    async function handleError(error) {
      let delay = false;
      let strategy = "rethrow";
      if (error instanceof HttpError) {
        delay = true;
        strategy = "retry";
      } else if (error instanceof GrammyError) {
        if (error.error_code >= 500) {
          delay = true;
          strategy = "retry";
        } else if (error.error_code === 429) {
          const retryAfter = error.parameters.retry_after;
          if (typeof retryAfter === "number") {
            await sleep(retryAfter, signal);
            lastDelay = INITIAL_DELAY;
          } else {
            delay = true;
          }
          strategy = "retry";
        }
      }
      if (delay) {
        if (lastDelay !== 50) {
          await sleep(lastDelay, signal);
        }
        const TWENTY_MINUTES = 20 * 60 * 1e3;
        lastDelay = Math.min(TWENTY_MINUTES, 2 * lastDelay);
      }
      return strategy;
    }
    let result = {
      ok: false
    };
    while (!result.ok) {
      try {
        result = {
          ok: true,
          value: await task()
        };
      } catch (error) {
        debugErr(error);
        const strategy = await handleError(error);
        switch (strategy) {
          case "retry":
            continue;
          case "rethrow":
            throw error;
        }
      }
    }
    return result.value;
  }
  async function sleep(seconds, signal) {
    let handle;
    let reject;
    function abort() {
      reject?.(new Error("Aborted delay"));
      if (handle !== void 0)
        clearTimeout(handle);
    }
    try {
      await new Promise((res, rej) => {
        reject = rej;
        if (signal?.aborted) {
          abort();
          return;
        }
        signal?.addEventListener("abort", abort);
        handle = setTimeout(res, 1e3 * seconds);
      });
    } finally {
      signal?.removeEventListener("abort", abort);
    }
  }
  function validateAllowedUpdates(updates, allowed = DEFAULT_UPDATE_TYPES) {
    const impossible = Array.from(updates).filter((u2) => !allowed.includes(u2));
    if (impossible.length > 0) {
      debugWarn(`You registered listeners for the following update types, but you did not specify them in \`allowed_updates\` so they may not be received: ${impossible.map((u2) => `'${u2}'`).join(", ")}`);
    }
  }
  function noUseFunction() {
    throw new Error(`It looks like you are registering more listeners on your bot from within other listeners! This means that every time your bot handles a message like this one, new listeners will be added. This list grows until your machine crashes, so grammY throws this error to tell you that you should probably do things a bit differently. If you're unsure how to resolve this problem, you can ask in the group chat: https://telegram.me/grammyjs

On the other hand, if you actually know what you're doing and you do need to install further middleware while your bot is running, consider installing a composer instance on your bot, and in turn augment the composer after the fact. This way, you can circumvent this protection against memory leaks.`);
  }
  var ALL_UPDATE_TYPES = [
    ...DEFAULT_UPDATE_TYPES,
    "chat_member",
    "message_reaction",
    "message_reaction_count"
  ];
  var ALL_CHAT_PERMISSIONS = {
    is_anonymous: true,
    can_manage_chat: true,
    can_delete_messages: true,
    can_manage_video_chats: true,
    can_restrict_members: true,
    can_promote_members: true,
    can_change_info: true,
    can_invite_users: true,
    can_post_stories: true,
    can_edit_stories: true,
    can_delete_stories: true,
    can_post_messages: true,
    can_edit_messages: true,
    can_pin_messages: true,
    can_manage_topics: true
  };
  var API_CONSTANTS = {
    DEFAULT_UPDATE_TYPES,
    ALL_UPDATE_TYPES,
    ALL_CHAT_PERMISSIONS
  };
  Object.freeze(API_CONSTANTS);
  var InlineKeyboard = class {
    inline_keyboard;
    constructor(inline_keyboard = [
      []
    ]) {
      this.inline_keyboard = inline_keyboard;
    }
    add(...buttons) {
      this.inline_keyboard[this.inline_keyboard.length - 1]?.push(...buttons);
      return this;
    }
    row(...buttons) {
      this.inline_keyboard.push(buttons);
      return this;
    }
    url(text, url) {
      return this.add(InlineKeyboard.url(text, url));
    }
    static url(text, url) {
      return {
        text,
        url
      };
    }
    text(text, data = text) {
      return this.add(InlineKeyboard.text(text, data));
    }
    static text(text, data = text) {
      return {
        text,
        callback_data: data
      };
    }
    webApp(text, url) {
      return this.add(InlineKeyboard.webApp(text, url));
    }
    static webApp(text, url) {
      return {
        text,
        web_app: {
          url
        }
      };
    }
    login(text, loginUrl) {
      return this.add(InlineKeyboard.login(text, loginUrl));
    }
    static login(text, loginUrl) {
      return {
        text,
        login_url: typeof loginUrl === "string" ? {
          url: loginUrl
        } : loginUrl
      };
    }
    switchInline(text, query = "") {
      return this.add(InlineKeyboard.switchInline(text, query));
    }
    static switchInline(text, query = "") {
      return {
        text,
        switch_inline_query: query
      };
    }
    switchInlineCurrent(text, query = "") {
      return this.add(InlineKeyboard.switchInlineCurrent(text, query));
    }
    static switchInlineCurrent(text, query = "") {
      return {
        text,
        switch_inline_query_current_chat: query
      };
    }
    switchInlineChosen(text, query = {}) {
      return this.add(InlineKeyboard.switchInlineChosen(text, query));
    }
    static switchInlineChosen(text, query = {}) {
      return {
        text,
        switch_inline_query_chosen_chat: query
      };
    }
    game(text) {
      return this.add(InlineKeyboard.game(text));
    }
    static game(text) {
      return {
        text,
        callback_game: {}
      };
    }
    pay(text) {
      return this.add(InlineKeyboard.pay(text));
    }
    static pay(text) {
      return {
        text,
        pay: true
      };
    }
    toTransposed() {
      const original = this.inline_keyboard;
      const transposed = transpose(original);
      return new InlineKeyboard(transposed);
    }
    toFlowed(columns, options = {}) {
      const original = this.inline_keyboard;
      const flowed = reflow(original, columns, options);
      return new InlineKeyboard(flowed);
    }
    clone() {
      return new InlineKeyboard(this.inline_keyboard.map((row) => row.slice()));
    }
    append(...sources) {
      for (const source of sources) {
        const keyboard = InlineKeyboard.from(source);
        this.inline_keyboard.push(...keyboard.inline_keyboard.map((row) => row.slice()));
      }
      return this;
    }
    static from(source) {
      if (source instanceof InlineKeyboard)
        return source.clone();
      return new InlineKeyboard(source.map((row) => row.slice()));
    }
  };
  function transpose(grid) {
    const transposed = [];
    for (let i2 = 0; i2 < grid.length; i2++) {
      const row = grid[i2];
      for (let j2 = 0; j2 < row.length; j2++) {
        const button = row[j2];
        (transposed[j2] ??= []).push(button);
      }
    }
    return transposed;
  }
  function reflow(grid, columns, { fillLastRow = false }) {
    let first = columns;
    if (fillLastRow) {
      const buttonCount = grid.map((row) => row.length).reduce((a2, b2) => a2 + b2, 0);
      first = buttonCount % columns;
    }
    const reflowed = [];
    for (const row of grid) {
      for (const button of row) {
        const at2 = Math.max(0, reflowed.length - 1);
        const max = at2 === 0 ? first : columns;
        let next = reflowed[at2] ??= [];
        if (next.length === max) {
          next = [];
          reflowed.push(next);
        }
        next.push(button);
      }
    }
    return reflowed;
  }
  var debug3 = browser$1("grammy:session");
  var SECRET_HEADER = "X-Telegram-Bot-Api-Secret-Token";
  var SECRET_HEADER_LOWERCASE = SECRET_HEADER.toLowerCase();
  var WRONG_TOKEN_ERROR = "secret token is wrong";
  var ok = () => new Response(null, {
    status: 200
  });
  var okJson = (json) => new Response(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
  var unauthorized = () => new Response('"unauthorized"', {
    status: 401,
    statusText: WRONG_TOKEN_ERROR
  });
  var awsLambda = (event, _context, callback) => ({
    update: JSON.parse(event.body ?? "{}"),
    header: event.headers[SECRET_HEADER],
    end: () => callback(null, {
      statusCode: 200
    }),
    respond: (json) => callback(null, {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: json
    }),
    unauthorized: () => callback(null, {
      statusCode: 401
    })
  });
  var awsLambdaAsync = (event, _context) => {
    let resolveResponse;
    return {
      update: JSON.parse(event.body ?? "{}"),
      header: event.headers[SECRET_HEADER],
      end: () => resolveResponse({
        statusCode: 200
      }),
      respond: (json) => resolveResponse({
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: json
      }),
      unauthorized: () => resolveResponse({
        statusCode: 401
      }),
      handlerReturn: new Promise((resolve) => {
        resolveResponse = resolve;
      })
    };
  };
  var azure = (request, context) => ({
    update: Promise.resolve(request.body),
    header: context.res?.headers?.[SECRET_HEADER],
    end: () => context.res = {
      status: 200,
      body: ""
    },
    respond: (json) => {
      context.res?.set?.("Content-Type", "application/json");
      context.res?.send?.(json);
    },
    unauthorized: () => {
      context.res?.send?.(401, WRONG_TOKEN_ERROR);
    }
  });
  var bun = (request) => {
    let resolveResponse;
    return {
      update: request.json(),
      header: request.headers.get(SECRET_HEADER) || void 0,
      end: () => {
        resolveResponse(ok());
      },
      respond: (json) => {
        resolveResponse(okJson(json));
      },
      unauthorized: () => {
        resolveResponse(unauthorized());
      }
    };
  };
  var cloudflare = (event) => {
    let resolveResponse;
    event.respondWith(new Promise((resolve) => {
      resolveResponse = resolve;
    }));
    return {
      update: event.request.json(),
      header: event.request.headers.get(SECRET_HEADER) || void 0,
      end: () => {
        resolveResponse(ok());
      },
      respond: (json) => {
        resolveResponse(okJson(json));
      },
      unauthorized: () => {
        resolveResponse(unauthorized());
      }
    };
  };
  var cloudflareModule = (request) => {
    let resolveResponse;
    return {
      update: request.json(),
      header: request.headers.get(SECRET_HEADER) || void 0,
      end: () => {
        resolveResponse(ok());
      },
      respond: (json) => {
        resolveResponse(okJson(json));
      },
      unauthorized: () => {
        resolveResponse(unauthorized());
      },
      handlerReturn: new Promise((resolve) => {
        resolveResponse = resolve;
      })
    };
  };
  var express = (req, res) => ({
    update: Promise.resolve(req.body),
    header: req.header(SECRET_HEADER),
    end: () => res.end(),
    respond: (json) => {
      res.set("Content-Type", "application/json");
      res.send(json);
    },
    unauthorized: () => {
      res.status(401).send(WRONG_TOKEN_ERROR);
    }
  });
  var fastify = (request, reply) => ({
    update: Promise.resolve(request.body),
    header: request.headers[SECRET_HEADER_LOWERCASE],
    end: () => reply.status(200).send(),
    respond: (json) => reply.headers({
      "Content-Type": "application/json"
    }).send(json),
    unauthorized: () => reply.code(401).send(WRONG_TOKEN_ERROR)
  });
  var hono = (c2) => {
    let resolveResponse;
    return {
      update: c2.req.json(),
      header: c2.req.header(SECRET_HEADER),
      end: () => {
        resolveResponse(c2.body(null));
      },
      respond: (json) => {
        resolveResponse(c2.json(json));
      },
      unauthorized: () => {
        c2.status(401);
        resolveResponse(c2.body(null));
      },
      handlerReturn: new Promise((resolve) => {
        resolveResponse = resolve;
      })
    };
  };
  var http = (req, res) => {
    const secretHeaderFromRequest = req.headers[SECRET_HEADER_LOWERCASE];
    return {
      update: new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk)).once("end", () => {
          const raw2 = Buffer.concat(chunks).toString("utf-8");
          resolve(JSON.parse(raw2));
        }).once("error", reject);
      }),
      header: Array.isArray(secretHeaderFromRequest) ? secretHeaderFromRequest[0] : secretHeaderFromRequest,
      end: () => res.end(),
      respond: (json) => res.writeHead(200, {
        "Content-Type": "application/json"
      }).end(json),
      unauthorized: () => res.writeHead(401).end(WRONG_TOKEN_ERROR)
    };
  };
  var koa = (ctx) => ({
    update: Promise.resolve(ctx.request.body),
    header: ctx.get(SECRET_HEADER) || void 0,
    end: () => {
      ctx.body = "";
    },
    respond: (json) => {
      ctx.set("Content-Type", "application/json");
      ctx.response.body = json;
    },
    unauthorized: () => {
      ctx.status = 401;
    }
  });
  var nextJs = (request, response) => ({
    update: Promise.resolve(request.body),
    header: request.headers[SECRET_HEADER_LOWERCASE],
    end: () => response.end(),
    respond: (json) => response.status(200).json(json),
    unauthorized: () => response.status(401).send(WRONG_TOKEN_ERROR)
  });
  var nhttp = (rev) => ({
    update: Promise.resolve(rev.body),
    header: rev.headers.get(SECRET_HEADER) || void 0,
    end: () => rev.response.sendStatus(200),
    respond: (json) => rev.response.status(200).send(json),
    unauthorized: () => rev.response.status(401).send(WRONG_TOKEN_ERROR)
  });
  var oak = (ctx) => ({
    update: ctx.request.body.json(),
    header: ctx.request.headers.get(SECRET_HEADER) || void 0,
    end: () => {
      ctx.response.status = 200;
    },
    respond: (json) => {
      ctx.response.type = "json";
      ctx.response.body = json;
    },
    unauthorized: () => {
      ctx.response.status = 401;
    }
  });
  var serveHttp = (requestEvent) => ({
    update: requestEvent.request.json(),
    header: requestEvent.request.headers.get(SECRET_HEADER) || void 0,
    end: () => requestEvent.respondWith(ok()),
    respond: (json) => requestEvent.respondWith(okJson(json)),
    unauthorized: () => requestEvent.respondWith(unauthorized())
  });
  var stdHttp = (req) => {
    let resolveResponse;
    return {
      update: req.json(),
      header: req.headers.get(SECRET_HEADER) || void 0,
      end: () => {
        if (resolveResponse)
          resolveResponse(ok());
      },
      respond: (json) => {
        if (resolveResponse)
          resolveResponse(okJson(json));
      },
      unauthorized: () => {
        if (resolveResponse)
          resolveResponse(unauthorized());
      },
      handlerReturn: new Promise((resolve) => {
        resolveResponse = resolve;
      })
    };
  };
  var sveltekit = ({ request }) => {
    let resolveResponse;
    return {
      update: Promise.resolve(request.json()),
      header: request.headers.get(SECRET_HEADER) || void 0,
      end: () => {
        if (resolveResponse)
          resolveResponse(ok());
      },
      respond: (json) => {
        if (resolveResponse)
          resolveResponse(okJson(json));
      },
      unauthorized: () => {
        if (resolveResponse)
          resolveResponse(unauthorized());
      },
      handlerReturn: new Promise((resolve) => {
        resolveResponse = resolve;
      })
    };
  };
  var worktop = (req, res) => ({
    update: Promise.resolve(req.json()),
    header: req.headers.get(SECRET_HEADER) ?? void 0,
    end: () => res.end(null),
    respond: (json) => res.send(200, json),
    unauthorized: () => res.send(401, WRONG_TOKEN_ERROR)
  });
  var adapters = {
    "aws-lambda": awsLambda,
    "aws-lambda-async": awsLambdaAsync,
    azure,
    bun,
    cloudflare,
    "cloudflare-mod": cloudflareModule,
    express,
    fastify,
    hono,
    http,
    https: http,
    koa,
    "next-js": nextJs,
    nhttp,
    oak,
    serveHttp,
    "std/http": stdHttp,
    sveltekit,
    worktop
  };
  var debugErr1 = browser$1("grammy:error");
  var callbackAdapter = (update, callback, header, unauthorized2 = () => callback('"unauthorized"')) => ({
    update: Promise.resolve(update),
    respond: callback,
    header,
    unauthorized: unauthorized2
  });
  var adapters1 = {
    ...adapters,
    callback: callbackAdapter
  };
  function webhookCallback(bot2, adapter = defaultAdapter, onTimeout, timeoutMilliseconds, secretToken) {
    const { onTimeout: timeout = "throw", timeoutMilliseconds: ms2 = 1e4, secretToken: token } = typeof onTimeout === "object" ? onTimeout : {
      onTimeout,
      timeoutMilliseconds,
      secretToken
    };
    let initialized = false;
    const server = typeof adapter === "string" ? adapters1[adapter] : adapter;
    return async (...args) => {
      const { update, respond, unauthorized: unauthorized2, end, handlerReturn, header } = server(...args);
      if (!initialized) {
        await bot2.init();
        initialized = true;
      }
      if (header !== token) {
        await unauthorized2();
        console.log(handlerReturn);
        return handlerReturn;
      }
      let usedWebhookReply = false;
      const webhookReplyEnvelope = {
        async send(json) {
          usedWebhookReply = true;
          await respond(json);
        }
      };
      await timeoutIfNecessary(bot2.handleUpdate(await update, webhookReplyEnvelope), typeof timeout === "function" ? () => timeout(...args) : timeout, ms2);
      if (!usedWebhookReply)
        end?.();
      return handlerReturn;
    };
  }
  function timeoutIfNecessary(task, onTimeout, timeout) {
    if (timeout === Infinity)
      return task;
    return new Promise((resolve, reject) => {
      const handle = setTimeout(() => {
        debugErr1(`Request timed out after ${timeout} ms`);
        if (onTimeout === "throw") {
          reject(new Error(`Request timed out after ${timeout} ms`));
        } else {
          if (typeof onTimeout === "function")
            onTimeout();
          resolve();
        }
        const now = Date.now();
        task.finally(() => {
          const diff = Date.now() - now;
          debugErr1(`Request completed ${diff} ms after timeout!`);
        });
      }, timeout);
      task.then(resolve).catch(reject).finally(() => clearTimeout(handle));
    });
  }

  // node_modules/@smithy/protocol-http/dist-es/extensions/httpExtensionConfiguration.js
  var getHttpHandlerExtensionConfiguration = (runtimeConfig) => {
    let httpHandler = runtimeConfig.httpHandler;
    return {
      setHttpHandler(handler) {
        httpHandler = handler;
      },
      httpHandler() {
        return httpHandler;
      },
      updateHttpClientConfig(key, value) {
        httpHandler.updateHttpClientConfig(key, value);
      },
      httpHandlerConfigs() {
        return httpHandler.httpHandlerConfigs();
      }
    };
  };
  var resolveHttpHandlerRuntimeConfig = (httpHandlerExtensionConfiguration) => {
    return {
      httpHandler: httpHandlerExtensionConfiguration.httpHandler()
    };
  };

  // node_modules/@smithy/types/dist-es/auth/auth.js
  var HttpAuthLocation;
  (function(HttpAuthLocation2) {
    HttpAuthLocation2["HEADER"] = "header";
    HttpAuthLocation2["QUERY"] = "query";
  })(HttpAuthLocation || (HttpAuthLocation = {}));

  // node_modules/@smithy/types/dist-es/auth/HttpApiKeyAuth.js
  var HttpApiKeyAuthLocation;
  (function(HttpApiKeyAuthLocation2) {
    HttpApiKeyAuthLocation2["HEADER"] = "header";
    HttpApiKeyAuthLocation2["QUERY"] = "query";
  })(HttpApiKeyAuthLocation || (HttpApiKeyAuthLocation = {}));

  // node_modules/@smithy/types/dist-es/endpoint.js
  var EndpointURLScheme;
  (function(EndpointURLScheme2) {
    EndpointURLScheme2["HTTP"] = "http";
    EndpointURLScheme2["HTTPS"] = "https";
  })(EndpointURLScheme || (EndpointURLScheme = {}));

  // node_modules/@smithy/types/dist-es/extensions/checksum.js
  var AlgorithmId;
  (function(AlgorithmId2) {
    AlgorithmId2["MD5"] = "md5";
    AlgorithmId2["CRC32"] = "crc32";
    AlgorithmId2["CRC32C"] = "crc32c";
    AlgorithmId2["SHA1"] = "sha1";
    AlgorithmId2["SHA256"] = "sha256";
  })(AlgorithmId || (AlgorithmId = {}));

  // node_modules/@smithy/types/dist-es/http.js
  var FieldPosition;
  (function(FieldPosition2) {
    FieldPosition2[FieldPosition2["HEADER"] = 0] = "HEADER";
    FieldPosition2[FieldPosition2["TRAILER"] = 1] = "TRAILER";
  })(FieldPosition || (FieldPosition = {}));

  // node_modules/@smithy/types/dist-es/middleware.js
  var SMITHY_CONTEXT_KEY = "__smithy_context";

  // node_modules/@smithy/types/dist-es/profile.js
  var IniSectionType;
  (function(IniSectionType2) {
    IniSectionType2["PROFILE"] = "profile";
    IniSectionType2["SSO_SESSION"] = "sso-session";
    IniSectionType2["SERVICES"] = "services";
  })(IniSectionType || (IniSectionType = {}));

  // node_modules/@smithy/types/dist-es/transfer.js
  var RequestHandlerProtocol;
  (function(RequestHandlerProtocol2) {
    RequestHandlerProtocol2["HTTP_0_9"] = "http/0.9";
    RequestHandlerProtocol2["HTTP_1_0"] = "http/1.0";
    RequestHandlerProtocol2["TDS_8_0"] = "tds/8.0";
  })(RequestHandlerProtocol || (RequestHandlerProtocol = {}));

  // node_modules/@smithy/protocol-http/dist-es/httpRequest.js
  var HttpRequest = class {
    constructor(options) {
      this.method = options.method || "GET";
      this.hostname = options.hostname || "localhost";
      this.port = options.port;
      this.query = options.query || {};
      this.headers = options.headers || {};
      this.body = options.body;
      this.protocol = options.protocol ? options.protocol.slice(-1) !== ":" ? `${options.protocol}:` : options.protocol : "https:";
      this.path = options.path ? options.path.charAt(0) !== "/" ? `/${options.path}` : options.path : "/";
      this.username = options.username;
      this.password = options.password;
      this.fragment = options.fragment;
    }
    static clone(request) {
      const cloned = new HttpRequest({
        ...request,
        headers: { ...request.headers }
      });
      if (cloned.query) {
        cloned.query = cloneQuery(cloned.query);
      }
      return cloned;
    }
    static isInstance(request) {
      if (!request) {
        return false;
      }
      const req = request;
      return "method" in req && "protocol" in req && "hostname" in req && "path" in req && typeof req["query"] === "object" && typeof req["headers"] === "object";
    }
    clone() {
      return HttpRequest.clone(this);
    }
  };
  function cloneQuery(query) {
    return Object.keys(query).reduce((carry, paramName) => {
      const param = query[paramName];
      return {
        ...carry,
        [paramName]: Array.isArray(param) ? [...param] : param
      };
    }, {});
  }

  // node_modules/@smithy/protocol-http/dist-es/httpResponse.js
  var HttpResponse = class {
    constructor(options) {
      this.statusCode = options.statusCode;
      this.reason = options.reason;
      this.headers = options.headers || {};
      this.body = options.body;
    }
    static isInstance(response) {
      if (!response)
        return false;
      const resp = response;
      return typeof resp.statusCode === "number" && typeof resp.headers === "object";
    }
  };

  // node_modules/@aws-sdk/middleware-expect-continue/dist-es/index.js
  function addExpectContinueMiddleware(options) {
    return (next) => async (args) => {
      const { request } = args;
      if (HttpRequest.isInstance(request) && request.body && options.runtime === "node") {
        if (options.requestHandler?.constructor?.name !== "FetchHttpHandler") {
          request.headers = {
            ...request.headers,
            Expect: "100-continue"
          };
        }
      }
      return next({
        ...args,
        request
      });
    };
  }
  var addExpectContinueMiddlewareOptions = {
    step: "build",
    tags: ["SET_EXPECT_HEADER", "EXPECT_HEADER"],
    name: "addExpectContinueMiddleware",
    override: true
  };
  var getAddExpectContinuePlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(addExpectContinueMiddleware(options), addExpectContinueMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-host-header/dist-es/index.js
  function resolveHostHeaderConfig(input) {
    return input;
  }
  var hostHeaderMiddleware = (options) => (next) => async (args) => {
    if (!HttpRequest.isInstance(args.request))
      return next(args);
    const { request } = args;
    const { handlerProtocol = "" } = options.requestHandler.metadata || {};
    if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
      delete request.headers["host"];
      request.headers[":authority"] = request.hostname + (request.port ? ":" + request.port : "");
    } else if (!request.headers["host"]) {
      let host = request.hostname;
      if (request.port != null)
        host += `:${request.port}`;
      request.headers["host"] = host;
    }
    return next(args);
  };
  var hostHeaderMiddlewareOptions = {
    name: "hostHeaderMiddleware",
    step: "build",
    priority: "low",
    tags: ["HOST"],
    override: true
  };
  var getHostHeaderPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-logger/dist-es/loggerMiddleware.js
  var loggerMiddleware = () => (next, context) => async (args) => {
    try {
      const response = await next(args);
      const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog, overrideOutputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      const outputFilterSensitiveLog = overrideOutputFilterSensitiveLog ?? context.outputFilterSensitiveLog;
      const { $metadata, ...outputWithoutMetadata } = response.output;
      logger2?.info?.({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        output: outputFilterSensitiveLog(outputWithoutMetadata),
        metadata: $metadata
      });
      return response;
    } catch (error) {
      const { clientName, commandName, logger: logger2, dynamoDbDocumentClientOptions = {} } = context;
      const { overrideInputFilterSensitiveLog } = dynamoDbDocumentClientOptions;
      const inputFilterSensitiveLog = overrideInputFilterSensitiveLog ?? context.inputFilterSensitiveLog;
      logger2?.error?.({
        clientName,
        commandName,
        input: inputFilterSensitiveLog(args.input),
        error,
        metadata: error.$metadata
      });
      throw error;
    }
  };
  var loggerMiddlewareOptions = {
    name: "loggerMiddleware",
    tags: ["LOGGER"],
    step: "initialize",
    override: true
  };
  var getLoggerPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(loggerMiddleware(), loggerMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-recursion-detection/dist-es/index.js
  var TRACE_ID_HEADER_NAME = "X-Amzn-Trace-Id";
  var ENV_LAMBDA_FUNCTION_NAME = "AWS_LAMBDA_FUNCTION_NAME";
  var ENV_TRACE_ID = "_X_AMZN_TRACE_ID";
  var recursionDetectionMiddleware = (options) => (next) => async (args) => {
    const { request } = args;
    if (!HttpRequest.isInstance(request) || options.runtime !== "node" || request.headers.hasOwnProperty(TRACE_ID_HEADER_NAME)) {
      return next(args);
    }
    const functionName = process.env[ENV_LAMBDA_FUNCTION_NAME];
    const traceId = process.env[ENV_TRACE_ID];
    const nonEmptyString = (str2) => typeof str2 === "string" && str2.length > 0;
    if (nonEmptyString(functionName) && nonEmptyString(traceId)) {
      request.headers[TRACE_ID_HEADER_NAME] = traceId;
    }
    return next({
      ...args,
      request
    });
  };
  var addRecursionDetectionMiddlewareOptions = {
    step: "build",
    tags: ["RECURSION_DETECTION"],
    name: "recursionDetectionMiddleware",
    override: true,
    priority: "low"
  };
  var getRecursionDetectionPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(recursionDetectionMiddleware(options), addRecursionDetectionMiddlewareOptions);
    }
  });

  // node_modules/@smithy/smithy-client/dist-es/NoOpLogger.js
  var NoOpLogger = class {
    trace() {
    }
    debug() {
    }
    info() {
    }
    warn() {
    }
    error() {
    }
  };

  // node_modules/@smithy/middleware-stack/dist-es/MiddlewareStack.js
  var getAllAliases = (name, aliases) => {
    const _aliases = [];
    if (name) {
      _aliases.push(name);
    }
    if (aliases) {
      for (const alias of aliases) {
        _aliases.push(alias);
      }
    }
    return _aliases;
  };
  var getMiddlewareNameWithAliases = (name, aliases) => {
    return `${name || "anonymous"}${aliases && aliases.length > 0 ? ` (a.k.a. ${aliases.join(",")})` : ""}`;
  };
  var constructStack = () => {
    let absoluteEntries = [];
    let relativeEntries = [];
    let identifyOnResolve = false;
    const entriesNameSet = /* @__PURE__ */ new Set();
    const sort = (entries) => entries.sort((a2, b2) => stepWeights[b2.step] - stepWeights[a2.step] || priorityWeights[b2.priority || "normal"] - priorityWeights[a2.priority || "normal"]);
    const removeByName = (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        const aliases = getAllAliases(entry.name, entry.aliases);
        if (aliases.includes(toRemove)) {
          isRemoved = true;
          for (const alias of aliases) {
            entriesNameSet.delete(alias);
          }
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    };
    const removeByReference = (toRemove) => {
      let isRemoved = false;
      const filterCb = (entry) => {
        if (entry.middleware === toRemove) {
          isRemoved = true;
          for (const alias of getAllAliases(entry.name, entry.aliases)) {
            entriesNameSet.delete(alias);
          }
          return false;
        }
        return true;
      };
      absoluteEntries = absoluteEntries.filter(filterCb);
      relativeEntries = relativeEntries.filter(filterCb);
      return isRemoved;
    };
    const cloneTo = (toStack) => {
      absoluteEntries.forEach((entry) => {
        toStack.add(entry.middleware, { ...entry });
      });
      relativeEntries.forEach((entry) => {
        toStack.addRelativeTo(entry.middleware, { ...entry });
      });
      toStack.identifyOnResolve?.(stack.identifyOnResolve());
      return toStack;
    };
    const expandRelativeMiddlewareList = (from) => {
      const expandedMiddlewareList = [];
      from.before.forEach((entry) => {
        if (entry.before.length === 0 && entry.after.length === 0) {
          expandedMiddlewareList.push(entry);
        } else {
          expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
        }
      });
      expandedMiddlewareList.push(from);
      from.after.reverse().forEach((entry) => {
        if (entry.before.length === 0 && entry.after.length === 0) {
          expandedMiddlewareList.push(entry);
        } else {
          expandedMiddlewareList.push(...expandRelativeMiddlewareList(entry));
        }
      });
      return expandedMiddlewareList;
    };
    const getMiddlewareList = (debug4 = false) => {
      const normalizedAbsoluteEntries = [];
      const normalizedRelativeEntries = [];
      const normalizedEntriesNameMap = {};
      absoluteEntries.forEach((entry) => {
        const normalizedEntry = {
          ...entry,
          before: [],
          after: []
        };
        for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
          normalizedEntriesNameMap[alias] = normalizedEntry;
        }
        normalizedAbsoluteEntries.push(normalizedEntry);
      });
      relativeEntries.forEach((entry) => {
        const normalizedEntry = {
          ...entry,
          before: [],
          after: []
        };
        for (const alias of getAllAliases(normalizedEntry.name, normalizedEntry.aliases)) {
          normalizedEntriesNameMap[alias] = normalizedEntry;
        }
        normalizedRelativeEntries.push(normalizedEntry);
      });
      normalizedRelativeEntries.forEach((entry) => {
        if (entry.toMiddleware) {
          const toMiddleware = normalizedEntriesNameMap[entry.toMiddleware];
          if (toMiddleware === void 0) {
            if (debug4) {
              return;
            }
            throw new Error(`${entry.toMiddleware} is not found when adding ${getMiddlewareNameWithAliases(entry.name, entry.aliases)} middleware ${entry.relation} ${entry.toMiddleware}`);
          }
          if (entry.relation === "after") {
            toMiddleware.after.push(entry);
          }
          if (entry.relation === "before") {
            toMiddleware.before.push(entry);
          }
        }
      });
      const mainChain = sort(normalizedAbsoluteEntries).map(expandRelativeMiddlewareList).reduce((wholeList, expandedMiddlewareList) => {
        wholeList.push(...expandedMiddlewareList);
        return wholeList;
      }, []);
      return mainChain;
    };
    const stack = {
      add: (middleware, options = {}) => {
        const { name, override, aliases: _aliases } = options;
        const entry = {
          step: "initialize",
          priority: "normal",
          middleware,
          ...options
        };
        const aliases = getAllAliases(name, _aliases);
        if (aliases.length > 0) {
          if (aliases.some((alias) => entriesNameSet.has(alias))) {
            if (!override)
              throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
            for (const alias of aliases) {
              const toOverrideIndex = absoluteEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
              if (toOverrideIndex === -1) {
                continue;
              }
              const toOverride = absoluteEntries[toOverrideIndex];
              if (toOverride.step !== entry.step || entry.priority !== toOverride.priority) {
                throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware with ${toOverride.priority} priority in ${toOverride.step} step cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware with ${entry.priority} priority in ${entry.step} step.`);
              }
              absoluteEntries.splice(toOverrideIndex, 1);
            }
          }
          for (const alias of aliases) {
            entriesNameSet.add(alias);
          }
        }
        absoluteEntries.push(entry);
      },
      addRelativeTo: (middleware, options) => {
        const { name, override, aliases: _aliases } = options;
        const entry = {
          middleware,
          ...options
        };
        const aliases = getAllAliases(name, _aliases);
        if (aliases.length > 0) {
          if (aliases.some((alias) => entriesNameSet.has(alias))) {
            if (!override)
              throw new Error(`Duplicate middleware name '${getMiddlewareNameWithAliases(name, _aliases)}'`);
            for (const alias of aliases) {
              const toOverrideIndex = relativeEntries.findIndex((entry2) => entry2.name === alias || entry2.aliases?.some((a2) => a2 === alias));
              if (toOverrideIndex === -1) {
                continue;
              }
              const toOverride = relativeEntries[toOverrideIndex];
              if (toOverride.toMiddleware !== entry.toMiddleware || toOverride.relation !== entry.relation) {
                throw new Error(`"${getMiddlewareNameWithAliases(toOverride.name, toOverride.aliases)}" middleware ${toOverride.relation} "${toOverride.toMiddleware}" middleware cannot be overridden by "${getMiddlewareNameWithAliases(name, _aliases)}" middleware ${entry.relation} "${entry.toMiddleware}" middleware.`);
              }
              relativeEntries.splice(toOverrideIndex, 1);
            }
          }
          for (const alias of aliases) {
            entriesNameSet.add(alias);
          }
        }
        relativeEntries.push(entry);
      },
      clone: () => cloneTo(constructStack()),
      use: (plugin) => {
        plugin.applyToStack(stack);
      },
      remove: (toRemove) => {
        if (typeof toRemove === "string")
          return removeByName(toRemove);
        else
          return removeByReference(toRemove);
      },
      removeByTag: (toRemove) => {
        let isRemoved = false;
        const filterCb = (entry) => {
          const { tags, name, aliases: _aliases } = entry;
          if (tags && tags.includes(toRemove)) {
            const aliases = getAllAliases(name, _aliases);
            for (const alias of aliases) {
              entriesNameSet.delete(alias);
            }
            isRemoved = true;
            return false;
          }
          return true;
        };
        absoluteEntries = absoluteEntries.filter(filterCb);
        relativeEntries = relativeEntries.filter(filterCb);
        return isRemoved;
      },
      concat: (from) => {
        const cloned = cloneTo(constructStack());
        cloned.use(from);
        cloned.identifyOnResolve(identifyOnResolve || cloned.identifyOnResolve() || (from.identifyOnResolve?.() ?? false));
        return cloned;
      },
      applyToStack: cloneTo,
      identify: () => {
        return getMiddlewareList(true).map((mw) => {
          const step = mw.step ?? mw.relation + " " + mw.toMiddleware;
          return getMiddlewareNameWithAliases(mw.name, mw.aliases) + " - " + step;
        });
      },
      identifyOnResolve(toggle) {
        if (typeof toggle === "boolean")
          identifyOnResolve = toggle;
        return identifyOnResolve;
      },
      resolve: (handler, context) => {
        for (const middleware of getMiddlewareList().map((entry) => entry.middleware).reverse()) {
          handler = middleware(handler, context);
        }
        if (identifyOnResolve) {
          console.log(stack.identify());
        }
        return handler;
      }
    };
    return stack;
  };
  var stepWeights = {
    initialize: 5,
    serialize: 4,
    build: 3,
    finalizeRequest: 2,
    deserialize: 1
  };
  var priorityWeights = {
    high: 3,
    normal: 2,
    low: 1
  };

  // node_modules/@smithy/smithy-client/dist-es/client.js
  var Client = class {
    constructor(config2) {
      this.middlewareStack = constructStack();
      this.config = config2;
    }
    send(command, optionsOrCb, cb2) {
      const options = typeof optionsOrCb !== "function" ? optionsOrCb : void 0;
      const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb2;
      const handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
      if (callback) {
        handler(command).then((result) => callback(null, result.output), (err) => callback(err)).catch(() => {
        });
      } else {
        return handler(command).then((result) => result.output);
      }
    }
    destroy() {
      if (this.config.requestHandler.destroy)
        this.config.requestHandler.destroy();
    }
  };

  // node_modules/@smithy/util-base64/dist-es/constants.browser.js
  var alphabetByEncoding = {};
  var alphabetByValue = new Array(64);
  for (let i2 = 0, start = "A".charCodeAt(0), limit = "Z".charCodeAt(0); i2 + start <= limit; i2++) {
    const char = String.fromCharCode(i2 + start);
    alphabetByEncoding[char] = i2;
    alphabetByValue[i2] = char;
  }
  for (let i2 = 0, start = "a".charCodeAt(0), limit = "z".charCodeAt(0); i2 + start <= limit; i2++) {
    const char = String.fromCharCode(i2 + start);
    const index = i2 + 26;
    alphabetByEncoding[char] = index;
    alphabetByValue[index] = char;
  }
  for (let i2 = 0; i2 < 10; i2++) {
    alphabetByEncoding[i2.toString(10)] = i2 + 52;
    const char = i2.toString(10);
    const index = i2 + 52;
    alphabetByEncoding[char] = index;
    alphabetByValue[index] = char;
  }
  alphabetByEncoding["+"] = 62;
  alphabetByValue[62] = "+";
  alphabetByEncoding["/"] = 63;
  alphabetByValue[63] = "/";
  var bitsPerLetter = 6;
  var bitsPerByte = 8;
  var maxLetterValue = 63;

  // node_modules/@smithy/util-base64/dist-es/fromBase64.browser.js
  var fromBase64 = (input) => {
    let totalByteLength = input.length / 4 * 3;
    if (input.slice(-2) === "==") {
      totalByteLength -= 2;
    } else if (input.slice(-1) === "=") {
      totalByteLength--;
    }
    const out = new ArrayBuffer(totalByteLength);
    const dataView = new DataView(out);
    for (let i2 = 0; i2 < input.length; i2 += 4) {
      let bits = 0;
      let bitLength = 0;
      for (let j2 = i2, limit = i2 + 3; j2 <= limit; j2++) {
        if (input[j2] !== "=") {
          if (!(input[j2] in alphabetByEncoding)) {
            throw new TypeError(`Invalid character ${input[j2]} in base64 string.`);
          }
          bits |= alphabetByEncoding[input[j2]] << (limit - j2) * bitsPerLetter;
          bitLength += bitsPerLetter;
        } else {
          bits >>= bitsPerLetter;
        }
      }
      const chunkOffset = i2 / 4 * 3;
      bits >>= bitLength % bitsPerByte;
      const byteLength = Math.floor(bitLength / bitsPerByte);
      for (let k2 = 0; k2 < byteLength; k2++) {
        const offset = (byteLength - k2 - 1) * bitsPerByte;
        dataView.setUint8(chunkOffset + k2, (bits & 255 << offset) >> offset);
      }
    }
    return new Uint8Array(out);
  };

  // node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
  var fromUtf8 = (input) => new TextEncoder().encode(input);

  // node_modules/@smithy/util-utf8/dist-es/toUint8Array.js
  var toUint8Array = (data) => {
    if (typeof data === "string") {
      return fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  };

  // node_modules/@smithy/util-utf8/dist-es/toUtf8.browser.js
  var toUtf8 = (input) => {
    if (typeof input === "string") {
      return input;
    }
    if (typeof input !== "object" || typeof input.byteOffset !== "number" || typeof input.byteLength !== "number") {
      throw new Error("@smithy/util-utf8: toUtf8 encoder function only accepts string | Uint8Array.");
    }
    return new TextDecoder("utf-8").decode(input);
  };

  // node_modules/@smithy/util-base64/dist-es/toBase64.browser.js
  function toBase64(_input) {
    let input;
    if (typeof _input === "string") {
      input = fromUtf8(_input);
    } else {
      input = _input;
    }
    const isArrayLike = typeof input === "object" && typeof input.length === "number";
    const isUint8Array = typeof input === "object" && typeof input.byteOffset === "number" && typeof input.byteLength === "number";
    if (!isArrayLike && !isUint8Array) {
      throw new Error("@smithy/util-base64: toBase64 encoder function only accepts string | Uint8Array.");
    }
    let str2 = "";
    for (let i2 = 0; i2 < input.length; i2 += 3) {
      let bits = 0;
      let bitLength = 0;
      for (let j2 = i2, limit = Math.min(i2 + 3, input.length); j2 < limit; j2++) {
        bits |= input[j2] << (limit - j2 - 1) * bitsPerByte;
        bitLength += bitsPerByte;
      }
      const bitClusterCount = Math.ceil(bitLength / bitsPerLetter);
      bits <<= bitClusterCount * bitsPerLetter - bitLength;
      for (let k2 = 1; k2 <= bitClusterCount; k2++) {
        const offset = (bitClusterCount - k2) * bitsPerLetter;
        str2 += alphabetByValue[(bits & maxLetterValue << offset) >> offset];
      }
      str2 += "==".slice(0, 4 - bitClusterCount);
    }
    return str2;
  }

  // node_modules/@smithy/util-stream/dist-es/blob/transforms.js
  function transformToString(payload, encoding = "utf-8") {
    if (encoding === "base64") {
      return toBase64(payload);
    }
    return toUtf8(payload);
  }
  function transformFromString(str2, encoding) {
    if (encoding === "base64") {
      return Uint8ArrayBlobAdapter.mutate(fromBase64(str2));
    }
    return Uint8ArrayBlobAdapter.mutate(fromUtf8(str2));
  }

  // node_modules/@smithy/util-stream/dist-es/blob/Uint8ArrayBlobAdapter.js
  var Uint8ArrayBlobAdapter = class extends Uint8Array {
    static fromString(source, encoding = "utf-8") {
      switch (typeof source) {
        case "string":
          return transformFromString(source, encoding);
        default:
          throw new Error(`Unsupported conversion from ${typeof source} to Uint8ArrayBlobAdapter.`);
      }
    }
    static mutate(source) {
      Object.setPrototypeOf(source, Uint8ArrayBlobAdapter.prototype);
      return source;
    }
    transformToString(encoding = "utf-8") {
      return transformToString(this, encoding);
    }
  };

  // node_modules/@smithy/util-stream/dist-es/getAwsChunkedEncodingStream.browser.js
  var getAwsChunkedEncodingStream = (readableStream, options) => {
    const { base64Encoder, bodyLengthChecker, checksumAlgorithmFn, checksumLocationName, streamHasher } = options;
    const checksumRequired = base64Encoder !== void 0 && bodyLengthChecker !== void 0 && checksumAlgorithmFn !== void 0 && checksumLocationName !== void 0 && streamHasher !== void 0;
    const digest = checksumRequired ? streamHasher(checksumAlgorithmFn, readableStream) : void 0;
    const reader = readableStream.getReader();
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await reader.read();
        if (done) {
          controller.enqueue(`0\r
`);
          if (checksumRequired) {
            const checksum = base64Encoder(await digest);
            controller.enqueue(`${checksumLocationName}:${checksum}\r
`);
            controller.enqueue(`\r
`);
          }
          controller.close();
        } else {
          controller.enqueue(`${(bodyLengthChecker(value) || 0).toString(16)}\r
${value}\r
`);
        }
      }
    });
  };

  // node_modules/@smithy/util-uri-escape/dist-es/escape-uri.js
  var escapeUri = (uri) => encodeURIComponent(uri).replace(/[!'()*]/g, hexEncode);
  var hexEncode = (c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`;

  // node_modules/@smithy/querystring-builder/dist-es/index.js
  function buildQueryString(query) {
    const parts = [];
    for (let key of Object.keys(query).sort()) {
      const value = query[key];
      key = escapeUri(key);
      if (Array.isArray(value)) {
        for (let i2 = 0, iLen = value.length; i2 < iLen; i2++) {
          parts.push(`${key}=${escapeUri(value[i2])}`);
        }
      } else {
        let qsEntry = key;
        if (value || typeof value === "string") {
          qsEntry += `=${escapeUri(value)}`;
        }
        parts.push(qsEntry);
      }
    }
    return parts.join("&");
  }

  // node_modules/@smithy/fetch-http-handler/dist-es/request-timeout.js
  function requestTimeout(timeoutInMs = 0) {
    return new Promise((resolve, reject) => {
      if (timeoutInMs) {
        setTimeout(() => {
          const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
          timeoutError.name = "TimeoutError";
          reject(timeoutError);
        }, timeoutInMs);
      }
    });
  }

  // node_modules/@smithy/fetch-http-handler/dist-es/fetch-http-handler.js
  var keepAliveSupport = {
    supported: void 0
  };
  var FetchHttpHandler = class {
    static create(instanceOrOptions) {
      if (typeof instanceOrOptions?.handle === "function") {
        return instanceOrOptions;
      }
      return new FetchHttpHandler(instanceOrOptions);
    }
    constructor(options) {
      if (typeof options === "function") {
        this.configProvider = options().then((opts) => opts || {});
      } else {
        this.config = options ?? {};
        this.configProvider = Promise.resolve(this.config);
      }
      if (keepAliveSupport.supported === void 0) {
        keepAliveSupport.supported = Boolean(typeof Request !== "undefined" && "keepalive" in new Request("https://[::1]"));
      }
    }
    destroy() {
    }
    async handle(request, { abortSignal } = {}) {
      if (!this.config) {
        this.config = await this.configProvider;
      }
      const requestTimeoutInMs = this.config.requestTimeout;
      const keepAlive = this.config.keepAlive === true;
      const credentials = this.config.credentials;
      if (abortSignal?.aborted) {
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        return Promise.reject(abortError);
      }
      let path = request.path;
      const queryString = buildQueryString(request.query || {});
      if (queryString) {
        path += `?${queryString}`;
      }
      if (request.fragment) {
        path += `#${request.fragment}`;
      }
      let auth = "";
      if (request.username != null || request.password != null) {
        const username = request.username ?? "";
        const password = request.password ?? "";
        auth = `${username}:${password}@`;
      }
      const { port, method } = request;
      const url = `${request.protocol}//${auth}${request.hostname}${port ? `:${port}` : ""}${path}`;
      const body = method === "GET" || method === "HEAD" ? void 0 : request.body;
      const requestOptions = {
        body,
        headers: new Headers(request.headers),
        method,
        credentials
      };
      if (body) {
        requestOptions.duplex = "half";
      }
      if (typeof AbortController !== "undefined") {
        requestOptions.signal = abortSignal;
      }
      if (keepAliveSupport.supported) {
        requestOptions.keepalive = keepAlive;
      }
      let removeSignalEventListener = () => {
      };
      const fetchRequest = new Request(url, requestOptions);
      const raceOfPromises = [
        fetch(fetchRequest).then((response) => {
          const fetchHeaders = response.headers;
          const transformedHeaders = {};
          for (const pair of fetchHeaders.entries()) {
            transformedHeaders[pair[0]] = pair[1];
          }
          const hasReadableStream = response.body != void 0;
          if (!hasReadableStream) {
            return response.blob().then((body2) => ({
              response: new HttpResponse({
                headers: transformedHeaders,
                reason: response.statusText,
                statusCode: response.status,
                body: body2
              })
            }));
          }
          return {
            response: new HttpResponse({
              headers: transformedHeaders,
              reason: response.statusText,
              statusCode: response.status,
              body: response.body
            })
          };
        }),
        requestTimeout(requestTimeoutInMs)
      ];
      if (abortSignal) {
        raceOfPromises.push(new Promise((resolve, reject) => {
          const onAbort = () => {
            const abortError = new Error("Request aborted");
            abortError.name = "AbortError";
            reject(abortError);
          };
          if (typeof abortSignal.addEventListener === "function") {
            const signal = abortSignal;
            signal.addEventListener("abort", onAbort, { once: true });
            removeSignalEventListener = () => signal.removeEventListener("abort", onAbort);
          } else {
            abortSignal.onabort = onAbort;
          }
        }));
      }
      return Promise.race(raceOfPromises).finally(removeSignalEventListener);
    }
    updateHttpClientConfig(key, value) {
      this.config = void 0;
      this.configProvider = this.configProvider.then((config2) => {
        config2[key] = value;
        return config2;
      });
    }
    httpHandlerConfigs() {
      return this.config ?? {};
    }
  };

  // node_modules/@smithy/fetch-http-handler/dist-es/stream-collector.js
  var streamCollector = (stream) => {
    if (typeof Blob === "function" && stream instanceof Blob) {
      return collectBlob(stream);
    }
    return collectStream(stream);
  };
  async function collectBlob(blob) {
    const base64 = await readToBase64(blob);
    const arrayBuffer = fromBase64(base64);
    return new Uint8Array(arrayBuffer);
  }
  async function collectStream(stream) {
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    let length = 0;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        length += value.length;
      }
      isDone = done;
    }
    const collected = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      collected.set(chunk, offset);
      offset += chunk.length;
    }
    return collected;
  }
  function readToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState !== 2) {
          return reject(new Error("Reader aborted too early"));
        }
        const result = reader.result ?? "";
        const commaIndex = result.indexOf(",");
        const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
        resolve(result.substring(dataOffset));
      };
      reader.onabort = () => reject(new Error("Read aborted"));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  // node_modules/@smithy/util-hex-encoding/dist-es/index.js
  var SHORT_TO_HEX = {};
  var HEX_TO_SHORT = {};
  for (let i2 = 0; i2 < 256; i2++) {
    let encodedByte = i2.toString(16).toLowerCase();
    if (encodedByte.length === 1) {
      encodedByte = `0${encodedByte}`;
    }
    SHORT_TO_HEX[i2] = encodedByte;
    HEX_TO_SHORT[encodedByte] = i2;
  }
  function fromHex(encoded) {
    if (encoded.length % 2 !== 0) {
      throw new Error("Hex encoded strings must have an even number length");
    }
    const out = new Uint8Array(encoded.length / 2);
    for (let i2 = 0; i2 < encoded.length; i2 += 2) {
      const encodedByte = encoded.slice(i2, i2 + 2).toLowerCase();
      if (encodedByte in HEX_TO_SHORT) {
        out[i2 / 2] = HEX_TO_SHORT[encodedByte];
      } else {
        throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
      }
    }
    return out;
  }
  function toHex(bytes) {
    let out = "";
    for (let i2 = 0; i2 < bytes.byteLength; i2++) {
      out += SHORT_TO_HEX[bytes[i2]];
    }
    return out;
  }

  // node_modules/@smithy/util-stream/dist-es/stream-type-check.js
  var isReadableStream = (stream) => typeof ReadableStream === "function" && (stream?.constructor?.name === ReadableStream.name || stream instanceof ReadableStream);

  // node_modules/@smithy/util-stream/dist-es/sdk-stream-mixin.browser.js
  var ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED = "The stream has already been transformed.";
  var sdkStreamMixin = (stream) => {
    if (!isBlobInstance(stream) && !isReadableStream(stream)) {
      const name = stream?.__proto__?.constructor?.name || stream;
      throw new Error(`Unexpected stream implementation, expect Blob or ReadableStream, got ${name}`);
    }
    let transformed = false;
    const transformToByteArray = async () => {
      if (transformed) {
        throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
      }
      transformed = true;
      return await streamCollector(stream);
    };
    const blobToWebStream = (blob) => {
      if (typeof blob.stream !== "function") {
        throw new Error("Cannot transform payload Blob to web stream. Please make sure the Blob.stream() is polyfilled.\nIf you are using React Native, this API is not yet supported, see: https://react-native.canny.io/feature-requests/p/fetch-streaming-body");
      }
      return blob.stream();
    };
    return Object.assign(stream, {
      transformToByteArray,
      transformToString: async (encoding) => {
        const buf = await transformToByteArray();
        if (encoding === "base64") {
          return toBase64(buf);
        } else if (encoding === "hex") {
          return toHex(buf);
        } else if (encoding === void 0 || encoding === "utf8" || encoding === "utf-8") {
          return toUtf8(buf);
        } else if (typeof TextDecoder === "function") {
          return new TextDecoder(encoding).decode(buf);
        } else {
          throw new Error("TextDecoder is not available, please make sure polyfill is provided.");
        }
      },
      transformToWebStream: () => {
        if (transformed) {
          throw new Error(ERR_MSG_STREAM_HAS_BEEN_TRANSFORMED);
        }
        transformed = true;
        if (isBlobInstance(stream)) {
          return blobToWebStream(stream);
        } else if (isReadableStream(stream)) {
          return stream;
        } else {
          throw new Error(`Cannot transform payload to web stream, got ${stream}`);
        }
      }
    });
  };
  var isBlobInstance = (stream) => typeof Blob === "function" && stream instanceof Blob;

  // node_modules/@smithy/util-stream/dist-es/splitStream.browser.js
  async function splitStream(stream) {
    if (typeof stream.stream === "function") {
      stream = stream.stream();
    }
    const readableStream = stream;
    return readableStream.tee();
  }

  // node_modules/@smithy/util-stream/dist-es/headStream.browser.js
  async function headStream(stream, bytes) {
    let byteLengthCounter = 0;
    const chunks = [];
    const reader = stream.getReader();
    let isDone = false;
    while (!isDone) {
      const { done, value } = await reader.read();
      if (value) {
        chunks.push(value);
        byteLengthCounter += value?.byteLength ?? 0;
      }
      if (byteLengthCounter >= bytes) {
        break;
      }
      isDone = done;
    }
    reader.releaseLock();
    const collected = new Uint8Array(Math.min(bytes, byteLengthCounter));
    let offset = 0;
    for (const chunk of chunks) {
      if (chunk.byteLength > collected.byteLength - offset) {
        collected.set(chunk.subarray(0, collected.byteLength - offset), offset);
        break;
      } else {
        collected.set(chunk, offset);
      }
      offset += chunk.length;
    }
    return collected;
  }

  // node_modules/@smithy/smithy-client/dist-es/collect-stream-body.js
  var collectBody = async (streamBody = new Uint8Array(), context) => {
    if (streamBody instanceof Uint8Array) {
      return Uint8ArrayBlobAdapter.mutate(streamBody);
    }
    if (!streamBody) {
      return Uint8ArrayBlobAdapter.mutate(new Uint8Array());
    }
    const fromContext = context.streamCollector(streamBody);
    return Uint8ArrayBlobAdapter.mutate(await fromContext);
  };

  // node_modules/@smithy/smithy-client/dist-es/command.js
  var Command = class {
    constructor() {
      this.middlewareStack = constructStack();
    }
    static classBuilder() {
      return new ClassBuilder();
    }
    resolveMiddlewareWithContext(clientStack, configuration, options, { middlewareFn, clientName, commandName, inputFilterSensitiveLog, outputFilterSensitiveLog, smithyContext, additionalContext, CommandCtor }) {
      for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
        this.middlewareStack.use(mw);
      }
      const stack = clientStack.concat(this.middlewareStack);
      const { logger: logger2 } = configuration;
      const handlerExecutionContext = {
        logger: logger2,
        clientName,
        commandName,
        inputFilterSensitiveLog,
        outputFilterSensitiveLog,
        [SMITHY_CONTEXT_KEY]: {
          commandInstance: this,
          ...smithyContext
        },
        ...additionalContext
      };
      const { requestHandler } = configuration;
      return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
  };
  var ClassBuilder = class {
    constructor() {
      this._init = () => {
      };
      this._ep = {};
      this._middlewareFn = () => [];
      this._commandName = "";
      this._clientName = "";
      this._additionalContext = {};
      this._smithyContext = {};
      this._inputFilterSensitiveLog = (_) => _;
      this._outputFilterSensitiveLog = (_) => _;
      this._serializer = null;
      this._deserializer = null;
    }
    init(cb2) {
      this._init = cb2;
    }
    ep(endpointParameterInstructions) {
      this._ep = endpointParameterInstructions;
      return this;
    }
    m(middlewareSupplier) {
      this._middlewareFn = middlewareSupplier;
      return this;
    }
    s(service, operation, smithyContext = {}) {
      this._smithyContext = {
        service,
        operation,
        ...smithyContext
      };
      return this;
    }
    c(additionalContext = {}) {
      this._additionalContext = additionalContext;
      return this;
    }
    n(clientName, commandName) {
      this._clientName = clientName;
      this._commandName = commandName;
      return this;
    }
    f(inputFilter = (_) => _, outputFilter = (_) => _) {
      this._inputFilterSensitiveLog = inputFilter;
      this._outputFilterSensitiveLog = outputFilter;
      return this;
    }
    ser(serializer) {
      this._serializer = serializer;
      return this;
    }
    de(deserializer) {
      this._deserializer = deserializer;
      return this;
    }
    build() {
      const closure = this;
      let CommandRef;
      return CommandRef = class extends Command {
        static getEndpointParameterInstructions() {
          return closure._ep;
        }
        constructor(...[input]) {
          super();
          this.serialize = closure._serializer;
          this.deserialize = closure._deserializer;
          this.input = input ?? {};
          closure._init(this);
        }
        resolveMiddleware(stack, configuration, options) {
          return this.resolveMiddlewareWithContext(stack, configuration, options, {
            CommandCtor: CommandRef,
            middlewareFn: closure._middlewareFn,
            clientName: closure._clientName,
            commandName: closure._commandName,
            inputFilterSensitiveLog: closure._inputFilterSensitiveLog,
            outputFilterSensitiveLog: closure._outputFilterSensitiveLog,
            smithyContext: closure._smithyContext,
            additionalContext: closure._additionalContext
          });
        }
      };
    }
  };

  // node_modules/@smithy/smithy-client/dist-es/constants.js
  var SENSITIVE_STRING = "***SensitiveInformation***";

  // node_modules/@smithy/smithy-client/dist-es/parse-utils.js
  var parseBoolean = (value) => {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      default:
        throw new Error(`Unable to parse boolean value "${value}"`);
    }
  };
  var expectNumber = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        if (String(parsed) !== String(value)) {
          logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
        }
        return parsed;
      }
    }
    if (typeof value === "number") {
      return value;
    }
    throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
  };
  var MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
  var expectFloat32 = (value) => {
    const expected = expectNumber(value);
    if (expected !== void 0 && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
      if (Math.abs(expected) > MAX_FLOAT) {
        throw new TypeError(`Expected 32-bit float, got ${value}`);
      }
    }
    return expected;
  };
  var expectLong = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (Number.isInteger(value) && !Number.isNaN(value)) {
      return value;
    }
    throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
  };
  var expectInt32 = (value) => expectSizedInt(value, 32);
  var expectShort = (value) => expectSizedInt(value, 16);
  var expectByte = (value) => expectSizedInt(value, 8);
  var expectSizedInt = (value, size) => {
    const expected = expectLong(value);
    if (expected !== void 0 && castInt(expected, size) !== expected) {
      throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
    }
    return expected;
  };
  var castInt = (value, size) => {
    switch (size) {
      case 32:
        return Int32Array.of(value)[0];
      case 16:
        return Int16Array.of(value)[0];
      case 8:
        return Int8Array.of(value)[0];
    }
  };
  var expectNonNull = (value, location) => {
    if (value === null || value === void 0) {
      if (location) {
        throw new TypeError(`Expected a non-null value for ${location}`);
      }
      throw new TypeError("Expected a non-null value");
    }
    return value;
  };
  var expectObject = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value === "object" && !Array.isArray(value)) {
      return value;
    }
    const receivedType = Array.isArray(value) ? "array" : typeof value;
    throw new TypeError(`Expected object, got ${receivedType}: ${value}`);
  };
  var expectString = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value === "string") {
      return value;
    }
    if (["boolean", "number", "bigint"].includes(typeof value)) {
      logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
      return String(value);
    }
    throw new TypeError(`Expected string, got ${typeof value}: ${value}`);
  };
  var strictParseFloat32 = (value) => {
    if (typeof value == "string") {
      return expectFloat32(parseNumber(value));
    }
    return expectFloat32(value);
  };
  var NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
  var parseNumber = (value) => {
    const matches = value.match(NUMBER_REGEX);
    if (matches === null || matches[0].length !== value.length) {
      throw new TypeError(`Expected real number, got implicit NaN`);
    }
    return parseFloat(value);
  };
  var strictParseLong = (value) => {
    if (typeof value === "string") {
      return expectLong(parseNumber(value));
    }
    return expectLong(value);
  };
  var strictParseInt32 = (value) => {
    if (typeof value === "string") {
      return expectInt32(parseNumber(value));
    }
    return expectInt32(value);
  };
  var strictParseShort = (value) => {
    if (typeof value === "string") {
      return expectShort(parseNumber(value));
    }
    return expectShort(value);
  };
  var strictParseByte = (value) => {
    if (typeof value === "string") {
      return expectByte(parseNumber(value));
    }
    return expectByte(value);
  };
  var stackTraceWarning = (message) => {
    return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s3) => !s3.includes("stackTraceWarning")).join("\n");
  };
  var logger = {
    warn: console.warn
  };

  // node_modules/@smithy/smithy-client/dist-es/date-utils.js
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dateToUtcString(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const dayOfWeek = date.getUTCDay();
    const dayOfMonthInt = date.getUTCDate();
    const hoursInt = date.getUTCHours();
    const minutesInt = date.getUTCMinutes();
    const secondsInt = date.getUTCSeconds();
    const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
    const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
    const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
    const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
    return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
  }
  var RFC3339 = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/);
  var RFC3339_WITH_OFFSET = new RegExp(/^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/);
  var parseRfc3339DateTimeWithOffset = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC-3339 date-times must be expressed as strings");
    }
    const match2 = RFC3339_WITH_OFFSET.exec(value);
    if (!match2) {
      throw new TypeError("Invalid RFC-3339 date-time value");
    }
    const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match2;
    const year = strictParseShort(stripLeadingZeroes(yearStr));
    const month = parseDateValue(monthStr, "month", 1, 12);
    const day = parseDateValue(dayStr, "day", 1, 31);
    const date = buildDate(year, month, day, { hours, minutes, seconds, fractionalMilliseconds });
    if (offsetStr.toUpperCase() != "Z") {
      date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
    }
    return date;
  };
  var IMF_FIXDATE = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
  var RFC_850_DATE = new RegExp(/^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/);
  var ASC_TIME = new RegExp(/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/);
  var parseRfc7231DateTime = (value) => {
    if (value === null || value === void 0) {
      return void 0;
    }
    if (typeof value !== "string") {
      throw new TypeError("RFC-7231 date-times must be expressed as strings");
    }
    let match2 = IMF_FIXDATE.exec(value);
    if (match2) {
      const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match2;
      return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
    }
    match2 = RFC_850_DATE.exec(value);
    if (match2) {
      const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match2;
      return adjustRfc850Year(buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
        hours,
        minutes,
        seconds,
        fractionalMilliseconds
      }));
    }
    match2 = ASC_TIME.exec(value);
    if (match2) {
      const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match2;
      return buildDate(strictParseShort(stripLeadingZeroes(yearStr)), parseMonthByShortName(monthStr), parseDateValue(dayStr.trimLeft(), "day", 1, 31), { hours, minutes, seconds, fractionalMilliseconds });
    }
    throw new TypeError("Invalid RFC-7231 date-time value");
  };
  var buildDate = (year, month, day, time) => {
    const adjustedMonth = month - 1;
    validateDayOfMonth(year, adjustedMonth, day);
    return new Date(Date.UTC(year, adjustedMonth, day, parseDateValue(time.hours, "hour", 0, 23), parseDateValue(time.minutes, "minute", 0, 59), parseDateValue(time.seconds, "seconds", 0, 60), parseMilliseconds(time.fractionalMilliseconds)));
  };
  var parseTwoDigitYear = (value) => {
    const thisYear = (/* @__PURE__ */ new Date()).getUTCFullYear();
    const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
    if (valueInThisCentury < thisYear) {
      return valueInThisCentury + 100;
    }
    return valueInThisCentury;
  };
  var FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1e3;
  var adjustRfc850Year = (input) => {
    if (input.getTime() - (/* @__PURE__ */ new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) {
      return new Date(Date.UTC(input.getUTCFullYear() - 100, input.getUTCMonth(), input.getUTCDate(), input.getUTCHours(), input.getUTCMinutes(), input.getUTCSeconds(), input.getUTCMilliseconds()));
    }
    return input;
  };
  var parseMonthByShortName = (value) => {
    const monthIdx = MONTHS.indexOf(value);
    if (monthIdx < 0) {
      throw new TypeError(`Invalid month: ${value}`);
    }
    return monthIdx + 1;
  };
  var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var validateDayOfMonth = (year, month, day) => {
    let maxDays = DAYS_IN_MONTH[month];
    if (month === 1 && isLeapYear(year)) {
      maxDays = 29;
    }
    if (day > maxDays) {
      throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
    }
  };
  var isLeapYear = (year) => {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  };
  var parseDateValue = (value, type, lower, upper) => {
    const dateVal = strictParseByte(stripLeadingZeroes(value));
    if (dateVal < lower || dateVal > upper) {
      throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
    }
    return dateVal;
  };
  var parseMilliseconds = (value) => {
    if (value === null || value === void 0) {
      return 0;
    }
    return strictParseFloat32("0." + value) * 1e3;
  };
  var parseOffsetToMilliseconds = (value) => {
    const directionStr = value[0];
    let direction = 1;
    if (directionStr == "+") {
      direction = 1;
    } else if (directionStr == "-") {
      direction = -1;
    } else {
      throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
    }
    const hour = Number(value.substring(1, 3));
    const minute = Number(value.substring(4, 6));
    return direction * (hour * 60 + minute) * 60 * 1e3;
  };
  var stripLeadingZeroes = (value) => {
    let idx = 0;
    while (idx < value.length - 1 && value.charAt(idx) === "0") {
      idx++;
    }
    if (idx === 0) {
      return value;
    }
    return value.slice(idx);
  };

  // node_modules/@smithy/smithy-client/dist-es/exceptions.js
  var ServiceException = class extends Error {
    constructor(options) {
      super(options.message);
      Object.setPrototypeOf(this, ServiceException.prototype);
      this.name = options.name;
      this.$fault = options.$fault;
      this.$metadata = options.$metadata;
    }
  };
  var decorateServiceException = (exception, additions = {}) => {
    Object.entries(additions).filter(([, v2]) => v2 !== void 0).forEach(([k2, v2]) => {
      if (exception[k2] == void 0 || exception[k2] === "") {
        exception[k2] = v2;
      }
    });
    const message = exception.message || exception.Message || "UnknownError";
    exception.message = message;
    delete exception.Message;
    return exception;
  };

  // node_modules/@smithy/smithy-client/dist-es/default-error-handler.js
  var throwDefaultError = ({ output, parsedBody, exceptionCtor, errorCode }) => {
    const $metadata = deserializeMetadata(output);
    const statusCode = $metadata.httpStatusCode ? $metadata.httpStatusCode + "" : void 0;
    const response = new exceptionCtor({
      name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
      $fault: "client",
      $metadata
    });
    throw decorateServiceException(response, parsedBody);
  };
  var withBaseException = (ExceptionCtor) => {
    return ({ output, parsedBody, errorCode }) => {
      throwDefaultError({ output, parsedBody, exceptionCtor: ExceptionCtor, errorCode });
    };
  };
  var deserializeMetadata = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"]
  });

  // node_modules/@smithy/smithy-client/dist-es/defaults-mode.js
  var loadConfigsForDefaultMode = (mode) => {
    switch (mode) {
      case "standard":
        return {
          retryMode: "standard",
          connectionTimeout: 3100
        };
      case "in-region":
        return {
          retryMode: "standard",
          connectionTimeout: 1100
        };
      case "cross-region":
        return {
          retryMode: "standard",
          connectionTimeout: 3100
        };
      case "mobile":
        return {
          retryMode: "standard",
          connectionTimeout: 3e4
        };
      default:
        return {};
    }
  };

  // node_modules/@smithy/smithy-client/dist-es/extensions/checksum.js
  var getChecksumConfiguration2 = (runtimeConfig) => {
    const checksumAlgorithms = [];
    for (const id in AlgorithmId) {
      const algorithmId = AlgorithmId[id];
      if (runtimeConfig[algorithmId] === void 0) {
        continue;
      }
      checksumAlgorithms.push({
        algorithmId: () => algorithmId,
        checksumConstructor: () => runtimeConfig[algorithmId]
      });
    }
    return {
      _checksumAlgorithms: checksumAlgorithms,
      addChecksumAlgorithm(algo) {
        this._checksumAlgorithms.push(algo);
      },
      checksumAlgorithms() {
        return this._checksumAlgorithms;
      }
    };
  };
  var resolveChecksumRuntimeConfig2 = (clientConfig) => {
    const runtimeConfig = {};
    clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
      runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
    });
    return runtimeConfig;
  };

  // node_modules/@smithy/smithy-client/dist-es/extensions/retry.js
  var getRetryConfiguration = (runtimeConfig) => {
    let _retryStrategy = runtimeConfig.retryStrategy;
    return {
      setRetryStrategy(retryStrategy) {
        _retryStrategy = retryStrategy;
      },
      retryStrategy() {
        return _retryStrategy;
      }
    };
  };
  var resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
    const runtimeConfig = {};
    runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
    return runtimeConfig;
  };

  // node_modules/@smithy/smithy-client/dist-es/extensions/defaultExtensionConfiguration.js
  var getDefaultExtensionConfiguration = (runtimeConfig) => {
    return {
      ...getChecksumConfiguration2(runtimeConfig),
      ...getRetryConfiguration(runtimeConfig)
    };
  };
  var resolveDefaultRuntimeConfig = (config2) => {
    return {
      ...resolveChecksumRuntimeConfig2(config2),
      ...resolveRetryRuntimeConfig(config2)
    };
  };

  // node_modules/@smithy/smithy-client/dist-es/extended-encode-uri-component.js
  function extendedEncodeURIComponent(str2) {
    return encodeURIComponent(str2).replace(/[!'()*]/g, function(c2) {
      return "%" + c2.charCodeAt(0).toString(16).toUpperCase();
    });
  }

  // node_modules/@smithy/smithy-client/dist-es/get-value-from-text-node.js
  var getValueFromTextNode = (obj) => {
    const textNodeName = "#text";
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== void 0) {
        obj[key] = obj[key][textNodeName];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = getValueFromTextNode(obj[key]);
      }
    }
    return obj;
  };

  // node_modules/@smithy/smithy-client/dist-es/lazy-json.js
  var StringWrapper = function() {
    const Class = Object.getPrototypeOf(this).constructor;
    const Constructor = Function.bind.apply(String, [null, ...arguments]);
    const instance = new Constructor();
    Object.setPrototypeOf(instance, Class.prototype);
    return instance;
  };
  StringWrapper.prototype = Object.create(String.prototype, {
    constructor: {
      value: StringWrapper,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  Object.setPrototypeOf(StringWrapper, String);

  // node_modules/@smithy/smithy-client/dist-es/object-mapping.js
  function map(arg0, arg1, arg2) {
    let target;
    let filter;
    let instructions;
    if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
      target = {};
      instructions = arg0;
    } else {
      target = arg0;
      if (typeof arg1 === "function") {
        filter = arg1;
        instructions = arg2;
        return mapWithFilter(target, filter, instructions);
      } else {
        instructions = arg1;
      }
    }
    for (const key of Object.keys(instructions)) {
      if (!Array.isArray(instructions[key])) {
        target[key] = instructions[key];
        continue;
      }
      applyInstruction(target, null, instructions, key);
    }
    return target;
  }
  var mapWithFilter = (target, filter, instructions) => {
    return map(target, Object.entries(instructions).reduce((_instructions, [key, value]) => {
      if (Array.isArray(value)) {
        _instructions[key] = value;
      } else {
        if (typeof value === "function") {
          _instructions[key] = [filter, value()];
        } else {
          _instructions[key] = [filter, value];
        }
      }
      return _instructions;
    }, {}));
  };
  var applyInstruction = (target, source, instructions, targetKey) => {
    if (source !== null) {
      let instruction = instructions[targetKey];
      if (typeof instruction === "function") {
        instruction = [, instruction];
      }
      const [filter2 = nonNullish, valueFn = pass2, sourceKey = targetKey] = instruction;
      if (typeof filter2 === "function" && filter2(source[sourceKey]) || typeof filter2 !== "function" && !!filter2) {
        target[targetKey] = valueFn(source[sourceKey]);
      }
      return;
    }
    let [filter, value] = instructions[targetKey];
    if (typeof value === "function") {
      let _value;
      const defaultFilterPassed = filter === void 0 && (_value = value()) != null;
      const customFilterPassed = typeof filter === "function" && !!filter(void 0) || typeof filter !== "function" && !!filter;
      if (defaultFilterPassed) {
        target[targetKey] = _value;
      } else if (customFilterPassed) {
        target[targetKey] = value();
      }
    } else {
      const defaultFilterPassed = filter === void 0 && value != null;
      const customFilterPassed = typeof filter === "function" && !!filter(value) || typeof filter !== "function" && !!filter;
      if (defaultFilterPassed || customFilterPassed) {
        target[targetKey] = value;
      }
    }
  };
  var nonNullish = (_) => _ != null;
  var pass2 = (_) => _;

  // node_modules/@smithy/smithy-client/dist-es/resolve-path.js
  var resolvedPath = (resolvedPath2, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) => {
    if (input != null && input[memberName] !== void 0) {
      const labelValue = labelValueProvider();
      if (labelValue.length <= 0) {
        throw new Error("Empty value provided for input HTTP label: " + memberName + ".");
      }
      resolvedPath2 = resolvedPath2.replace(uriLabel, isGreedyLabel ? labelValue.split("/").map((segment) => extendedEncodeURIComponent(segment)).join("/") : extendedEncodeURIComponent(labelValue));
    } else {
      throw new Error("No value provided for input HTTP label: " + memberName + ".");
    }
    return resolvedPath2;
  };

  // node_modules/@smithy/smithy-client/dist-es/ser-utils.js
  var serializeDateTime = (date) => date.toISOString().replace(".000Z", "Z");

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/check-content-length-header.js
  var CONTENT_LENGTH_HEADER = "content-length";
  function checkContentLengthHeader() {
    return (next, context) => async (args) => {
      const { request } = args;
      if (HttpRequest.isInstance(request)) {
        if (!(CONTENT_LENGTH_HEADER in request.headers)) {
          const message = `Are you using a Stream of unknown length as the Body of a PutObject request? Consider using Upload instead from @aws-sdk/lib-storage.`;
          if (typeof context?.logger?.warn === "function" && !(context.logger instanceof NoOpLogger)) {
            context.logger.warn(message);
          } else {
            console.warn(message);
          }
        }
      }
      return next({ ...args });
    };
  }
  var checkContentLengthHeaderMiddlewareOptions = {
    step: "finalizeRequest",
    tags: ["CHECK_CONTENT_LENGTH_HEADER"],
    name: "getCheckContentLengthHeaderPlugin",
    override: true
  };
  var getCheckContentLengthHeaderPlugin = (unused) => ({
    applyToStack: (clientStack) => {
      clientStack.add(checkContentLengthHeader(), checkContentLengthHeaderMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-endpoint-middleware.js
  var regionRedirectEndpointMiddleware = (config2) => {
    return (next, context) => async (args) => {
      const originalRegion = await config2.region();
      const regionProviderRef = config2.region;
      let unlock = () => {
      };
      if (context.__s3RegionRedirect) {
        Object.defineProperty(config2, "region", {
          writable: false,
          value: async () => {
            return context.__s3RegionRedirect;
          }
        });
        unlock = () => Object.defineProperty(config2, "region", {
          writable: true,
          value: regionProviderRef
        });
      }
      try {
        const result = await next(args);
        if (context.__s3RegionRedirect) {
          unlock();
          const region = await config2.region();
          if (originalRegion !== region) {
            throw new Error("Region was not restored following S3 region redirect.");
          }
        }
        return result;
      } catch (e2) {
        unlock();
        throw e2;
      }
    };
  };
  var regionRedirectEndpointMiddlewareOptions = {
    tags: ["REGION_REDIRECT", "S3"],
    name: "regionRedirectEndpointMiddleware",
    override: true,
    relation: "before",
    toMiddleware: "endpointV2Middleware"
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/region-redirect-middleware.js
  function regionRedirectMiddleware(clientConfig) {
    return (next, context) => async (args) => {
      try {
        return await next(args);
      } catch (err) {
        if (clientConfig.followRegionRedirects && err?.$metadata?.httpStatusCode === 301) {
          try {
            const actualRegion = err.$response.headers["x-amz-bucket-region"];
            context.logger?.debug(`Redirecting from ${await clientConfig.region()} to ${actualRegion}`);
            context.__s3RegionRedirect = actualRegion;
          } catch (e2) {
            throw new Error("Region redirect failed: " + e2);
          }
          return next(args);
        } else {
          throw err;
        }
      }
    };
  }
  var regionRedirectMiddlewareOptions = {
    step: "initialize",
    tags: ["REGION_REDIRECT", "S3"],
    name: "regionRedirectMiddleware",
    override: true
  };
  var getRegionRedirectMiddlewarePlugin = (clientConfig) => ({
    applyToStack: (clientStack) => {
      clientStack.add(regionRedirectMiddleware(clientConfig), regionRedirectMiddlewareOptions);
      clientStack.addRelativeTo(regionRedirectEndpointMiddleware(clientConfig), regionRedirectEndpointMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-expires-middleware.js
  var s3ExpiresMiddleware = (config2) => {
    return (next, context) => async (args) => {
      const result = await next(args);
      const { response } = result;
      if (HttpResponse.isInstance(response)) {
        if (response.headers.expires) {
          response.headers.expiresstring = response.headers.expires;
          try {
            parseRfc7231DateTime(response.headers.expires);
          } catch (e2) {
            context.logger?.warn(`AWS SDK Warning for ${context.clientName}::${context.commandName} response parsing (${response.headers.expires}): ${e2}`);
            delete response.headers.expires;
          }
        }
      }
      return result;
    };
  };
  var s3ExpiresMiddlewareOptions = {
    tags: ["S3"],
    name: "s3ExpiresMiddleware",
    override: true,
    relation: "after",
    toMiddleware: "deserializerMiddleware"
  };
  var getS3ExpiresMiddlewarePlugin = (clientConfig) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(s3ExpiresMiddleware(clientConfig), s3ExpiresMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCache.js
  var S3ExpressIdentityCache = class {
    constructor(data = {}) {
      this.data = data;
      this.lastPurgeTime = Date.now();
    }
    get(key) {
      const entry = this.data[key];
      if (!entry) {
        return;
      }
      return entry;
    }
    set(key, entry) {
      this.data[key] = entry;
      return entry;
    }
    delete(key) {
      delete this.data[key];
    }
    async purgeExpired() {
      const now = Date.now();
      if (this.lastPurgeTime + S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS > now) {
        return;
      }
      for (const key in this.data) {
        const entry = this.data[key];
        if (!entry.isRefreshing) {
          const credential = await entry.identity;
          if (credential.expiration) {
            if (credential.expiration.getTime() < now) {
              delete this.data[key];
            }
          }
        }
      }
    }
  };
  S3ExpressIdentityCache.EXPIRED_CREDENTIAL_PURGE_INTERVAL_MS = 3e4;

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityCacheEntry.js
  var S3ExpressIdentityCacheEntry = class {
    constructor(_identity, isRefreshing = false, accessed = Date.now()) {
      this._identity = _identity;
      this.isRefreshing = isRefreshing;
      this.accessed = accessed;
    }
    get identity() {
      this.accessed = Date.now();
      return this._identity;
    }
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/S3ExpressIdentityProviderImpl.js
  var S3ExpressIdentityProviderImpl = class {
    constructor(createSessionFn, cache = new S3ExpressIdentityCache()) {
      this.createSessionFn = createSessionFn;
      this.cache = cache;
    }
    async getS3ExpressIdentity(awsIdentity, identityProperties) {
      const key = identityProperties.Bucket;
      const { cache } = this;
      const entry = cache.get(key);
      if (entry) {
        return entry.identity.then((identity) => {
          const isExpired = (identity.expiration?.getTime() ?? 0) < Date.now();
          if (isExpired) {
            return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
          }
          const isExpiringSoon = (identity.expiration?.getTime() ?? 0) < Date.now() + S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS;
          if (isExpiringSoon && !entry.isRefreshing) {
            entry.isRefreshing = true;
            this.getIdentity(key).then((id) => {
              cache.set(key, new S3ExpressIdentityCacheEntry(Promise.resolve(id)));
            });
          }
          return identity;
        });
      }
      return cache.set(key, new S3ExpressIdentityCacheEntry(this.getIdentity(key))).identity;
    }
    async getIdentity(key) {
      await this.cache.purgeExpired().catch((error) => {
        console.warn("Error while clearing expired entries in S3ExpressIdentityCache: \n" + error);
      });
      const session = await this.createSessionFn(key);
      if (!session.Credentials?.AccessKeyId || !session.Credentials?.SecretAccessKey) {
        throw new Error("s3#createSession response credential missing AccessKeyId or SecretAccessKey.");
      }
      const identity = {
        accessKeyId: session.Credentials.AccessKeyId,
        secretAccessKey: session.Credentials.SecretAccessKey,
        sessionToken: session.Credentials.SessionToken,
        expiration: session.Credentials.Expiration ? new Date(session.Credentials.Expiration) : void 0
      };
      return identity;
    }
  };
  S3ExpressIdentityProviderImpl.REFRESH_WINDOW_MS = 6e4;

  // node_modules/@smithy/util-middleware/dist-es/getSmithyContext.js
  var getSmithyContext = (context) => context[SMITHY_CONTEXT_KEY] || (context[SMITHY_CONTEXT_KEY] = {});

  // node_modules/@smithy/util-middleware/dist-es/normalizeProvider.js
  var normalizeProvider = (input) => {
    if (typeof input === "function")
      return input;
    const promisified = Promise.resolve(input);
    return () => promisified;
  };

  // node_modules/@smithy/signature-v4/dist-es/constants.js
  var ALGORITHM_QUERY_PARAM = "X-Amz-Algorithm";
  var CREDENTIAL_QUERY_PARAM = "X-Amz-Credential";
  var AMZ_DATE_QUERY_PARAM = "X-Amz-Date";
  var SIGNED_HEADERS_QUERY_PARAM = "X-Amz-SignedHeaders";
  var EXPIRES_QUERY_PARAM = "X-Amz-Expires";
  var SIGNATURE_QUERY_PARAM = "X-Amz-Signature";
  var TOKEN_QUERY_PARAM = "X-Amz-Security-Token";
  var AUTH_HEADER = "authorization";
  var AMZ_DATE_HEADER = AMZ_DATE_QUERY_PARAM.toLowerCase();
  var DATE_HEADER = "date";
  var GENERATED_HEADERS = [AUTH_HEADER, AMZ_DATE_HEADER, DATE_HEADER];
  var SIGNATURE_HEADER = SIGNATURE_QUERY_PARAM.toLowerCase();
  var SHA256_HEADER = "x-amz-content-sha256";
  var TOKEN_HEADER = TOKEN_QUERY_PARAM.toLowerCase();
  var ALWAYS_UNSIGNABLE_HEADERS = {
    authorization: true,
    "cache-control": true,
    connection: true,
    expect: true,
    from: true,
    "keep-alive": true,
    "max-forwards": true,
    pragma: true,
    referer: true,
    te: true,
    trailer: true,
    "transfer-encoding": true,
    upgrade: true,
    "user-agent": true,
    "x-amzn-trace-id": true
  };
  var PROXY_HEADER_PATTERN = /^proxy-/;
  var SEC_HEADER_PATTERN = /^sec-/;
  var ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256";
  var EVENT_ALGORITHM_IDENTIFIER = "AWS4-HMAC-SHA256-PAYLOAD";
  var UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";
  var MAX_CACHE_SIZE = 50;
  var KEY_TYPE_IDENTIFIER = "aws4_request";
  var MAX_PRESIGNED_TTL = 60 * 60 * 24 * 7;

  // node_modules/@smithy/signature-v4/dist-es/credentialDerivation.js
  var signingKeyCache = {};
  var cacheQueue = [];
  var createScope = (shortDate, region, service) => `${shortDate}/${region}/${service}/${KEY_TYPE_IDENTIFIER}`;
  var getSigningKey = async (sha256Constructor, credentials, shortDate, region, service) => {
    const credsHash = await hmac(sha256Constructor, credentials.secretAccessKey, credentials.accessKeyId);
    const cacheKey = `${shortDate}:${region}:${service}:${toHex(credsHash)}:${credentials.sessionToken}`;
    if (cacheKey in signingKeyCache) {
      return signingKeyCache[cacheKey];
    }
    cacheQueue.push(cacheKey);
    while (cacheQueue.length > MAX_CACHE_SIZE) {
      delete signingKeyCache[cacheQueue.shift()];
    }
    let key = `AWS4${credentials.secretAccessKey}`;
    for (const signable of [shortDate, region, service, KEY_TYPE_IDENTIFIER]) {
      key = await hmac(sha256Constructor, key, signable);
    }
    return signingKeyCache[cacheKey] = key;
  };
  var hmac = (ctor, secret, data) => {
    const hash = new ctor(secret);
    hash.update(toUint8Array(data));
    return hash.digest();
  };

  // node_modules/@smithy/signature-v4/dist-es/getCanonicalHeaders.js
  var getCanonicalHeaders = ({ headers }, unsignableHeaders, signableHeaders) => {
    const canonical = {};
    for (const headerName of Object.keys(headers).sort()) {
      if (headers[headerName] == void 0) {
        continue;
      }
      const canonicalHeaderName = headerName.toLowerCase();
      if (canonicalHeaderName in ALWAYS_UNSIGNABLE_HEADERS || unsignableHeaders?.has(canonicalHeaderName) || PROXY_HEADER_PATTERN.test(canonicalHeaderName) || SEC_HEADER_PATTERN.test(canonicalHeaderName)) {
        if (!signableHeaders || signableHeaders && !signableHeaders.has(canonicalHeaderName)) {
          continue;
        }
      }
      canonical[canonicalHeaderName] = headers[headerName].trim().replace(/\s+/g, " ");
    }
    return canonical;
  };

  // node_modules/@smithy/signature-v4/dist-es/getCanonicalQuery.js
  var getCanonicalQuery = ({ query = {} }) => {
    const keys = [];
    const serialized = {};
    for (const key of Object.keys(query).sort()) {
      if (key.toLowerCase() === SIGNATURE_HEADER) {
        continue;
      }
      keys.push(key);
      const value = query[key];
      if (typeof value === "string") {
        serialized[key] = `${escapeUri(key)}=${escapeUri(value)}`;
      } else if (Array.isArray(value)) {
        serialized[key] = value.slice(0).reduce((encoded, value2) => encoded.concat([`${escapeUri(key)}=${escapeUri(value2)}`]), []).sort().join("&");
      }
    }
    return keys.map((key) => serialized[key]).filter((serialized2) => serialized2).join("&");
  };

  // node_modules/@smithy/is-array-buffer/dist-es/index.js
  var isArrayBuffer = (arg) => typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer || Object.prototype.toString.call(arg) === "[object ArrayBuffer]";

  // node_modules/@smithy/signature-v4/dist-es/getPayloadHash.js
  var getPayloadHash = async ({ headers, body }, hashConstructor) => {
    for (const headerName of Object.keys(headers)) {
      if (headerName.toLowerCase() === SHA256_HEADER) {
        return headers[headerName];
      }
    }
    if (body == void 0) {
      return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    } else if (typeof body === "string" || ArrayBuffer.isView(body) || isArrayBuffer(body)) {
      const hashCtor = new hashConstructor();
      hashCtor.update(toUint8Array(body));
      return toHex(await hashCtor.digest());
    }
    return UNSIGNED_PAYLOAD;
  };

  // node_modules/@smithy/signature-v4/dist-es/HeaderFormatter.js
  var HeaderFormatter = class {
    format(headers) {
      const chunks = [];
      for (const headerName of Object.keys(headers)) {
        const bytes = fromUtf8(headerName);
        chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
      }
      const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
      let position = 0;
      for (const chunk of chunks) {
        out.set(chunk, position);
        position += chunk.byteLength;
      }
      return out;
    }
    formatHeaderValue(header) {
      switch (header.type) {
        case "boolean":
          return Uint8Array.from([header.value ? 0 : 1]);
        case "byte":
          return Uint8Array.from([2, header.value]);
        case "short":
          const shortView = new DataView(new ArrayBuffer(3));
          shortView.setUint8(0, 3);
          shortView.setInt16(1, header.value, false);
          return new Uint8Array(shortView.buffer);
        case "integer":
          const intView = new DataView(new ArrayBuffer(5));
          intView.setUint8(0, 4);
          intView.setInt32(1, header.value, false);
          return new Uint8Array(intView.buffer);
        case "long":
          const longBytes = new Uint8Array(9);
          longBytes[0] = 5;
          longBytes.set(header.value.bytes, 1);
          return longBytes;
        case "binary":
          const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
          binView.setUint8(0, 6);
          binView.setUint16(1, header.value.byteLength, false);
          const binBytes = new Uint8Array(binView.buffer);
          binBytes.set(header.value, 3);
          return binBytes;
        case "string":
          const utf8Bytes = fromUtf8(header.value);
          const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
          strView.setUint8(0, 7);
          strView.setUint16(1, utf8Bytes.byteLength, false);
          const strBytes = new Uint8Array(strView.buffer);
          strBytes.set(utf8Bytes, 3);
          return strBytes;
        case "timestamp":
          const tsBytes = new Uint8Array(9);
          tsBytes[0] = 8;
          tsBytes.set(Int64.fromNumber(header.value.valueOf()).bytes, 1);
          return tsBytes;
        case "uuid":
          if (!UUID_PATTERN.test(header.value)) {
            throw new Error(`Invalid UUID received: ${header.value}`);
          }
          const uuidBytes = new Uint8Array(17);
          uuidBytes[0] = 9;
          uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
          return uuidBytes;
      }
    }
  };
  var HEADER_VALUE_TYPE;
  (function(HEADER_VALUE_TYPE3) {
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
  })(HEADER_VALUE_TYPE || (HEADER_VALUE_TYPE = {}));
  var UUID_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
  var Int64 = class {
    constructor(bytes) {
      this.bytes = bytes;
      if (bytes.byteLength !== 8) {
        throw new Error("Int64 buffers must be exactly 8 bytes");
      }
    }
    static fromNumber(number) {
      if (number > 9223372036854776e3 || number < -9223372036854776e3) {
        throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
      }
      const bytes = new Uint8Array(8);
      for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
        bytes[i2] = remaining;
      }
      if (number < 0) {
        negate(bytes);
      }
      return new Int64(bytes);
    }
    valueOf() {
      const bytes = this.bytes.slice(0);
      const negative = bytes[0] & 128;
      if (negative) {
        negate(bytes);
      }
      return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
    }
    toString() {
      return String(this.valueOf());
    }
  };
  function negate(bytes) {
    for (let i2 = 0; i2 < 8; i2++) {
      bytes[i2] ^= 255;
    }
    for (let i2 = 7; i2 > -1; i2--) {
      bytes[i2]++;
      if (bytes[i2] !== 0)
        break;
    }
  }

  // node_modules/@smithy/signature-v4/dist-es/headerUtil.js
  var hasHeader = (soughtHeader, headers) => {
    soughtHeader = soughtHeader.toLowerCase();
    for (const headerName of Object.keys(headers)) {
      if (soughtHeader === headerName.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  // node_modules/@smithy/signature-v4/dist-es/moveHeadersToQuery.js
  var moveHeadersToQuery = (request, options = {}) => {
    const { headers, query = {} } = HttpRequest.clone(request);
    for (const name of Object.keys(headers)) {
      const lname = name.toLowerCase();
      if (lname.slice(0, 6) === "x-amz-" && !options.unhoistableHeaders?.has(lname)) {
        query[name] = headers[name];
        delete headers[name];
      }
    }
    return {
      ...request,
      headers,
      query
    };
  };

  // node_modules/@smithy/signature-v4/dist-es/prepareRequest.js
  var prepareRequest = (request) => {
    request = HttpRequest.clone(request);
    for (const headerName of Object.keys(request.headers)) {
      if (GENERATED_HEADERS.indexOf(headerName.toLowerCase()) > -1) {
        delete request.headers[headerName];
      }
    }
    return request;
  };

  // node_modules/@smithy/signature-v4/dist-es/utilDate.js
  var iso8601 = (time) => toDate(time).toISOString().replace(/\.\d{3}Z$/, "Z");
  var toDate = (time) => {
    if (typeof time === "number") {
      return new Date(time * 1e3);
    }
    if (typeof time === "string") {
      if (Number(time)) {
        return new Date(Number(time) * 1e3);
      }
      return new Date(time);
    }
    return time;
  };

  // node_modules/@smithy/signature-v4/dist-es/SignatureV4.js
  var SignatureV4 = class {
    constructor({ applyChecksum, credentials, region, service, sha256, uriEscapePath = true }) {
      this.headerFormatter = new HeaderFormatter();
      this.service = service;
      this.sha256 = sha256;
      this.uriEscapePath = uriEscapePath;
      this.applyChecksum = typeof applyChecksum === "boolean" ? applyChecksum : true;
      this.regionProvider = normalizeProvider(region);
      this.credentialProvider = normalizeProvider(credentials);
    }
    async presign(originalRequest, options = {}) {
      const { signingDate = /* @__PURE__ */ new Date(), expiresIn = 3600, unsignableHeaders, unhoistableHeaders, signableHeaders, signingRegion, signingService } = options;
      const credentials = await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const { longDate, shortDate } = formatDate(signingDate);
      if (expiresIn > MAX_PRESIGNED_TTL) {
        return Promise.reject("Signature version 4 presigned URLs must have an expiration date less than one week in the future");
      }
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const request = moveHeadersToQuery(prepareRequest(originalRequest), { unhoistableHeaders });
      if (credentials.sessionToken) {
        request.query[TOKEN_QUERY_PARAM] = credentials.sessionToken;
      }
      request.query[ALGORITHM_QUERY_PARAM] = ALGORITHM_IDENTIFIER;
      request.query[CREDENTIAL_QUERY_PARAM] = `${credentials.accessKeyId}/${scope}`;
      request.query[AMZ_DATE_QUERY_PARAM] = longDate;
      request.query[EXPIRES_QUERY_PARAM] = expiresIn.toString(10);
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      request.query[SIGNED_HEADERS_QUERY_PARAM] = getCanonicalHeaderList(canonicalHeaders);
      request.query[SIGNATURE_QUERY_PARAM] = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, await getPayloadHash(originalRequest, this.sha256)));
      return request;
    }
    async sign(toSign, options) {
      if (typeof toSign === "string") {
        return this.signString(toSign, options);
      } else if (toSign.headers && toSign.payload) {
        return this.signEvent(toSign, options);
      } else if (toSign.message) {
        return this.signMessage(toSign, options);
      } else {
        return this.signRequest(toSign, options);
      }
    }
    async signEvent({ headers, payload }, { signingDate = /* @__PURE__ */ new Date(), priorSignature, signingRegion, signingService }) {
      const region = signingRegion ?? await this.regionProvider();
      const { shortDate, longDate } = formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      const hashedPayload = await getPayloadHash({ headers: {}, body: payload }, this.sha256);
      const hash = new this.sha256();
      hash.update(headers);
      const hashedHeaders = toHex(await hash.digest());
      const stringToSign = [
        EVENT_ALGORITHM_IDENTIFIER,
        longDate,
        scope,
        priorSignature,
        hashedHeaders,
        hashedPayload
      ].join("\n");
      return this.signString(stringToSign, { signingDate, signingRegion: region, signingService });
    }
    async signMessage(signableMessage, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService }) {
      const promise = this.signEvent({
        headers: this.headerFormatter.format(signableMessage.message.headers),
        payload: signableMessage.message.body
      }, {
        signingDate,
        signingRegion,
        signingService,
        priorSignature: signableMessage.priorSignature
      });
      return promise.then((signature) => {
        return { message: signableMessage.message, signature };
      });
    }
    async signString(stringToSign, { signingDate = /* @__PURE__ */ new Date(), signingRegion, signingService } = {}) {
      const credentials = await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const { shortDate } = formatDate(signingDate);
      const hash = new this.sha256(await this.getSigningKey(credentials, region, shortDate, signingService));
      hash.update(toUint8Array(stringToSign));
      return toHex(await hash.digest());
    }
    async signRequest(requestToSign, { signingDate = /* @__PURE__ */ new Date(), signableHeaders, unsignableHeaders, signingRegion, signingService } = {}) {
      const credentials = await this.credentialProvider();
      this.validateResolvedCredentials(credentials);
      const region = signingRegion ?? await this.regionProvider();
      const request = prepareRequest(requestToSign);
      const { longDate, shortDate } = formatDate(signingDate);
      const scope = createScope(shortDate, region, signingService ?? this.service);
      request.headers[AMZ_DATE_HEADER] = longDate;
      if (credentials.sessionToken) {
        request.headers[TOKEN_HEADER] = credentials.sessionToken;
      }
      const payloadHash = await getPayloadHash(request, this.sha256);
      if (!hasHeader(SHA256_HEADER, request.headers) && this.applyChecksum) {
        request.headers[SHA256_HEADER] = payloadHash;
      }
      const canonicalHeaders = getCanonicalHeaders(request, unsignableHeaders, signableHeaders);
      const signature = await this.getSignature(longDate, scope, this.getSigningKey(credentials, region, shortDate, signingService), this.createCanonicalRequest(request, canonicalHeaders, payloadHash));
      request.headers[AUTH_HEADER] = `${ALGORITHM_IDENTIFIER} Credential=${credentials.accessKeyId}/${scope}, SignedHeaders=${getCanonicalHeaderList(canonicalHeaders)}, Signature=${signature}`;
      return request;
    }
    createCanonicalRequest(request, canonicalHeaders, payloadHash) {
      const sortedHeaders = Object.keys(canonicalHeaders).sort();
      return `${request.method}
${this.getCanonicalPath(request)}
${getCanonicalQuery(request)}
${sortedHeaders.map((name) => `${name}:${canonicalHeaders[name]}`).join("\n")}

${sortedHeaders.join(";")}
${payloadHash}`;
    }
    async createStringToSign(longDate, credentialScope, canonicalRequest) {
      const hash = new this.sha256();
      hash.update(toUint8Array(canonicalRequest));
      const hashedRequest = await hash.digest();
      return `${ALGORITHM_IDENTIFIER}
${longDate}
${credentialScope}
${toHex(hashedRequest)}`;
    }
    getCanonicalPath({ path }) {
      if (this.uriEscapePath) {
        const normalizedPathSegments = [];
        for (const pathSegment of path.split("/")) {
          if (pathSegment?.length === 0)
            continue;
          if (pathSegment === ".")
            continue;
          if (pathSegment === "..") {
            normalizedPathSegments.pop();
          } else {
            normalizedPathSegments.push(pathSegment);
          }
        }
        const normalizedPath = `${path?.startsWith("/") ? "/" : ""}${normalizedPathSegments.join("/")}${normalizedPathSegments.length > 0 && path?.endsWith("/") ? "/" : ""}`;
        const doubleEncoded = escapeUri(normalizedPath);
        return doubleEncoded.replace(/%2F/g, "/");
      }
      return path;
    }
    async getSignature(longDate, credentialScope, keyPromise, canonicalRequest) {
      const stringToSign = await this.createStringToSign(longDate, credentialScope, canonicalRequest);
      const hash = new this.sha256(await keyPromise);
      hash.update(toUint8Array(stringToSign));
      return toHex(await hash.digest());
    }
    getSigningKey(credentials, region, shortDate, service) {
      return getSigningKey(this.sha256, credentials, shortDate, region, service || this.service);
    }
    validateResolvedCredentials(credentials) {
      if (typeof credentials !== "object" || typeof credentials.accessKeyId !== "string" || typeof credentials.secretAccessKey !== "string") {
        throw new Error("Resolved credential object is not valid");
      }
    }
  };
  var formatDate = (now) => {
    const longDate = iso8601(now).replace(/[\-:]/g, "");
    return {
      longDate,
      shortDate: longDate.slice(0, 8)
    };
  };
  var getCanonicalHeaderList = (headers) => Object.keys(headers).sort().join(";");

  // node_modules/@smithy/util-config-provider/dist-es/types.js
  var SelectorType;
  (function(SelectorType2) {
    SelectorType2["ENV"] = "env";
    SelectorType2["CONFIG"] = "shared config entry";
  })(SelectorType || (SelectorType = {}));

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/constants.js
  var S3_EXPRESS_BUCKET_TYPE = "Directory";
  var S3_EXPRESS_BACKEND = "S3Express";
  var S3_EXPRESS_AUTH_SCHEME = "sigv4-s3express";
  var SESSION_TOKEN_QUERY_PARAM = "X-Amz-S3session-Token";
  var SESSION_TOKEN_HEADER = SESSION_TOKEN_QUERY_PARAM.toLowerCase();

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/classes/SignatureV4S3Express.js
  var SignatureV4S3Express = class extends SignatureV4 {
    async signWithCredentials(requestToSign, credentials, options) {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      requestToSign.headers[SESSION_TOKEN_HEADER] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return privateAccess.signRequest(requestToSign, options ?? {});
    }
    async presignWithCredentials(requestToSign, credentials, options) {
      const credentialsWithoutSessionToken = getCredentialsWithoutSessionToken(credentials);
      delete requestToSign.headers[SESSION_TOKEN_HEADER];
      requestToSign.headers[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      requestToSign.query = requestToSign.query ?? {};
      requestToSign.query[SESSION_TOKEN_QUERY_PARAM] = credentials.sessionToken;
      const privateAccess = this;
      setSingleOverride(privateAccess, credentialsWithoutSessionToken);
      return this.presign(requestToSign, options);
    }
  };
  function getCredentialsWithoutSessionToken(credentials) {
    const credentialsWithoutSessionToken = {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      expiration: credentials.expiration
    };
    return credentialsWithoutSessionToken;
  }
  function setSingleOverride(privateAccess, credentialsWithoutSessionToken) {
    const id = setTimeout(() => {
      throw new Error("SignatureV4S3Express credential override was created but not called.");
    }, 10);
    const currentCredentialProvider = privateAccess.credentialProvider;
    const overrideCredentialsProviderOnce = () => {
      clearTimeout(id);
      privateAccess.credentialProvider = currentCredentialProvider;
      return Promise.resolve(credentialsWithoutSessionToken);
    };
    privateAccess.credentialProvider = overrideCredentialsProviderOnce;
  }

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressMiddleware.js
  var s3ExpressMiddleware = (options) => {
    return (next, context) => async (args) => {
      if (context.endpointV2) {
        const endpoint = context.endpointV2;
        const isS3ExpressAuth = endpoint.properties?.authSchemes?.[0]?.name === S3_EXPRESS_AUTH_SCHEME;
        const isS3ExpressBucket = endpoint.properties?.backend === S3_EXPRESS_BACKEND || endpoint.properties?.bucketType === S3_EXPRESS_BUCKET_TYPE;
        if (isS3ExpressBucket) {
          context.isS3ExpressBucket = true;
        }
        if (isS3ExpressAuth) {
          const requestBucket = args.input.Bucket;
          if (requestBucket) {
            const s3ExpressIdentity = await options.s3ExpressIdentityProvider.getS3ExpressIdentity(await options.credentials(), {
              Bucket: requestBucket
            });
            context.s3ExpressIdentity = s3ExpressIdentity;
            if (HttpRequest.isInstance(args.request) && s3ExpressIdentity.sessionToken) {
              args.request.headers[SESSION_TOKEN_HEADER] = s3ExpressIdentity.sessionToken;
            }
          }
        }
      }
      return next(args);
    };
  };
  var s3ExpressMiddlewareOptions = {
    name: "s3ExpressMiddleware",
    step: "build",
    tags: ["S3", "S3_EXPRESS"],
    override: true
  };
  var getS3ExpressPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(s3ExpressMiddleware(options), s3ExpressMiddlewareOptions);
    }
  });

  // node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/httpAuthSchemeMiddleware.js
  function convertHttpAuthSchemesToMap(httpAuthSchemes) {
    const map2 = /* @__PURE__ */ new Map();
    for (const scheme of httpAuthSchemes) {
      map2.set(scheme.schemeId, scheme);
    }
    return map2;
  }
  var httpAuthSchemeMiddleware = (config2, mwOptions) => (next, context) => async (args) => {
    const options = config2.httpAuthSchemeProvider(await mwOptions.httpAuthSchemeParametersProvider(config2, context, args.input));
    const authSchemes = convertHttpAuthSchemesToMap(config2.httpAuthSchemes);
    const smithyContext = getSmithyContext(context);
    const failureReasons = [];
    for (const option of options) {
      const scheme = authSchemes.get(option.schemeId);
      if (!scheme) {
        failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` was not enabled for this service.`);
        continue;
      }
      const identityProvider = scheme.identityProvider(await mwOptions.identityProviderConfigProvider(config2));
      if (!identityProvider) {
        failureReasons.push(`HttpAuthScheme \`${option.schemeId}\` did not have an IdentityProvider configured.`);
        continue;
      }
      const { identityProperties = {}, signingProperties = {} } = option.propertiesExtractor?.(config2, context) || {};
      option.identityProperties = Object.assign(option.identityProperties || {}, identityProperties);
      option.signingProperties = Object.assign(option.signingProperties || {}, signingProperties);
      smithyContext.selectedHttpAuthScheme = {
        httpAuthOption: option,
        identity: await identityProvider(option.identityProperties),
        signer: scheme.signer
      };
      break;
    }
    if (!smithyContext.selectedHttpAuthScheme) {
      throw new Error(failureReasons.join("\n"));
    }
    return next(args);
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/service-customizations/s3.js
  var resolveParamsForS3 = async (endpointParams) => {
    const bucket = endpointParams?.Bucket || "";
    if (typeof endpointParams.Bucket === "string") {
      endpointParams.Bucket = bucket.replace(/#/g, encodeURIComponent("#")).replace(/\?/g, encodeURIComponent("?"));
    }
    if (isArnBucketName(bucket)) {
      if (endpointParams.ForcePathStyle === true) {
        throw new Error("Path-style addressing cannot be used with ARN buckets");
      }
    } else if (!isDnsCompatibleBucketName(bucket) || bucket.indexOf(".") !== -1 && !String(endpointParams.Endpoint).startsWith("http:") || bucket.toLowerCase() !== bucket || bucket.length < 3) {
      endpointParams.ForcePathStyle = true;
    }
    if (endpointParams.DisableMultiRegionAccessPoints) {
      endpointParams.disableMultiRegionAccessPoints = true;
      endpointParams.DisableMRAP = true;
    }
    return endpointParams;
  };
  var DOMAIN_PATTERN = /^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/;
  var IP_ADDRESS_PATTERN = /(\d+\.){3}\d+/;
  var DOTS_PATTERN = /\.\./;
  var isDnsCompatibleBucketName = (bucketName) => DOMAIN_PATTERN.test(bucketName) && !IP_ADDRESS_PATTERN.test(bucketName) && !DOTS_PATTERN.test(bucketName);
  var isArnBucketName = (bucketName) => {
    const [arn, partition2, service, , , bucket] = bucketName.split(":");
    const isArn = arn === "arn" && bucketName.split(":").length >= 6;
    const isValidArn = Boolean(isArn && partition2 && service && bucket);
    if (isArn && !isValidArn) {
      throw new Error(`Invalid ARN: ${bucketName} was an invalid ARN.`);
    }
    return isValidArn;
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/adaptors/createConfigValueProvider.js
  var createConfigValueProvider = (configKey, canonicalEndpointParamKey, config2) => {
    const configProvider = async () => {
      const configValue = config2[configKey] ?? config2[canonicalEndpointParamKey];
      if (typeof configValue === "function") {
        return configValue();
      }
      return configValue;
    };
    if (configKey === "credentialScope" || canonicalEndpointParamKey === "CredentialScope") {
      return async () => {
        const credentials = typeof config2.credentials === "function" ? await config2.credentials() : config2.credentials;
        const configValue = credentials?.credentialScope ?? credentials?.CredentialScope;
        return configValue;
      };
    }
    if (configKey === "accountId" || canonicalEndpointParamKey === "AccountId") {
      return async () => {
        const credentials = typeof config2.credentials === "function" ? await config2.credentials() : config2.credentials;
        const configValue = credentials?.accountId ?? credentials?.AccountId;
        return configValue;
      };
    }
    if (configKey === "endpoint" || canonicalEndpointParamKey === "endpoint") {
      return async () => {
        const endpoint = await configProvider();
        if (endpoint && typeof endpoint === "object") {
          if ("url" in endpoint) {
            return endpoint.url.href;
          }
          if ("hostname" in endpoint) {
            const { protocol, hostname, port, path } = endpoint;
            return `${protocol}//${hostname}${port ? ":" + port : ""}${path}`;
          }
        }
        return endpoint;
      };
    }
    return configProvider;
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromConfig.browser.js
  var getEndpointFromConfig = async (serviceId) => void 0;

  // node_modules/@smithy/querystring-parser/dist-es/index.js
  function parseQueryString(querystring) {
    const query = {};
    querystring = querystring.replace(/^\?/, "");
    if (querystring) {
      for (const pair of querystring.split("&")) {
        let [key, value = null] = pair.split("=");
        key = decodeURIComponent(key);
        if (value) {
          value = decodeURIComponent(value);
        }
        if (!(key in query)) {
          query[key] = value;
        } else if (Array.isArray(query[key])) {
          query[key].push(value);
        } else {
          query[key] = [query[key], value];
        }
      }
    }
    return query;
  }

  // node_modules/@smithy/url-parser/dist-es/index.js
  var parseUrl = (url) => {
    if (typeof url === "string") {
      return parseUrl(new URL(url));
    }
    const { hostname, pathname, port, protocol, search } = url;
    let query;
    if (search) {
      query = parseQueryString(search);
    }
    return {
      hostname,
      port: port ? parseInt(port) : void 0,
      protocol,
      path: pathname,
      query
    };
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/adaptors/toEndpointV1.js
  var toEndpointV1 = (endpoint) => {
    if (typeof endpoint === "object") {
      if ("url" in endpoint) {
        return parseUrl(endpoint.url);
      }
      return endpoint;
    }
    return parseUrl(endpoint);
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/adaptors/getEndpointFromInstructions.js
  var getEndpointFromInstructions = async (commandInput, instructionsSupplier, clientConfig, context) => {
    if (!clientConfig.endpoint) {
      const endpointFromConfig = await getEndpointFromConfig(clientConfig.serviceId || "");
      if (endpointFromConfig) {
        clientConfig.endpoint = () => Promise.resolve(toEndpointV1(endpointFromConfig));
      }
    }
    const endpointParams = await resolveParams(commandInput, instructionsSupplier, clientConfig);
    if (typeof clientConfig.endpointProvider !== "function") {
      throw new Error("config.endpointProvider is not set.");
    }
    const endpoint = clientConfig.endpointProvider(endpointParams, context);
    return endpoint;
  };
  var resolveParams = async (commandInput, instructionsSupplier, clientConfig) => {
    const endpointParams = {};
    const instructions = instructionsSupplier?.getEndpointParameterInstructions?.() || {};
    for (const [name, instruction] of Object.entries(instructions)) {
      switch (instruction.type) {
        case "staticContextParams":
          endpointParams[name] = instruction.value;
          break;
        case "contextParams":
          endpointParams[name] = commandInput[instruction.name];
          break;
        case "clientContextParams":
        case "builtInParams":
          endpointParams[name] = await createConfigValueProvider(instruction.name, name, clientConfig)();
          break;
        default:
          throw new Error("Unrecognized endpoint parameter instruction: " + JSON.stringify(instruction));
      }
    }
    if (Object.keys(instructions).length === 0) {
      Object.assign(endpointParams, clientConfig);
    }
    if (String(clientConfig.serviceId).toLowerCase() === "s3") {
      await resolveParamsForS3(endpointParams);
    }
    return endpointParams;
  };

  // node_modules/@smithy/middleware-endpoint/dist-es/endpointMiddleware.js
  var endpointMiddleware = ({ config: config2, instructions }) => {
    return (next, context) => async (args) => {
      const endpoint = await getEndpointFromInstructions(args.input, {
        getEndpointParameterInstructions() {
          return instructions;
        }
      }, { ...config2 }, context);
      context.endpointV2 = endpoint;
      context.authSchemes = endpoint.properties?.authSchemes;
      const authScheme = context.authSchemes?.[0];
      if (authScheme) {
        context["signing_region"] = authScheme.signingRegion;
        context["signing_service"] = authScheme.signingName;
        const smithyContext = getSmithyContext(context);
        const httpAuthOption = smithyContext?.selectedHttpAuthScheme?.httpAuthOption;
        if (httpAuthOption) {
          httpAuthOption.signingProperties = Object.assign(httpAuthOption.signingProperties || {}, {
            signing_region: authScheme.signingRegion,
            signingRegion: authScheme.signingRegion,
            signing_service: authScheme.signingName,
            signingName: authScheme.signingName,
            signingRegionSet: authScheme.signingRegionSet
          }, authScheme.properties);
        }
      }
      return next({
        ...args
      });
    };
  };

  // node_modules/@smithy/middleware-serde/dist-es/deserializerMiddleware.js
  var deserializerMiddleware = (options, deserializer) => (next) => async (args) => {
    const { response } = await next(args);
    try {
      const parsed = await deserializer(response, options);
      return {
        response,
        output: parsed
      };
    } catch (error) {
      Object.defineProperty(error, "$response", {
        value: response
      });
      if (!("$metadata" in error)) {
        const hint = `Deserialization error: to see the raw response, inspect the hidden field {error}.$response on this object.`;
        error.message += "\n  " + hint;
        if (typeof error.$responseBodyText !== "undefined") {
          if (error.$response) {
            error.$response.body = error.$responseBodyText;
          }
        }
      }
      throw error;
    }
  };

  // node_modules/@smithy/middleware-serde/dist-es/serializerMiddleware.js
  var serializerMiddleware = (options, serializer) => (next, context) => async (args) => {
    const endpoint = context.endpointV2?.url && options.urlParser ? async () => options.urlParser(context.endpointV2.url) : options.endpoint;
    if (!endpoint) {
      throw new Error("No valid endpoint provider available.");
    }
    const request = await serializer(args.input, { ...options, endpoint });
    return next({
      ...args,
      request
    });
  };

  // node_modules/@smithy/middleware-serde/dist-es/serdePlugin.js
  var deserializerMiddlewareOption = {
    name: "deserializerMiddleware",
    step: "deserialize",
    tags: ["DESERIALIZER"],
    override: true
  };
  var serializerMiddlewareOption = {
    name: "serializerMiddleware",
    step: "serialize",
    tags: ["SERIALIZER"],
    override: true
  };
  function getSerdePlugin(config2, serializer, deserializer) {
    return {
      applyToStack: (commandStack) => {
        commandStack.add(deserializerMiddleware(config2, deserializer), deserializerMiddlewareOption);
        commandStack.add(serializerMiddleware(config2, serializer), serializerMiddlewareOption);
      }
    };
  }

  // node_modules/@smithy/middleware-endpoint/dist-es/getEndpointPlugin.js
  var endpointMiddlewareOptions = {
    step: "serialize",
    tags: ["ENDPOINT_PARAMETERS", "ENDPOINT_V2", "ENDPOINT"],
    name: "endpointV2Middleware",
    override: true,
    relation: "before",
    toMiddleware: serializerMiddlewareOption.name
  };
  var getEndpointPlugin = (config2, instructions) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(endpointMiddleware({
        config: config2,
        instructions
      }), endpointMiddlewareOptions);
    }
  });

  // node_modules/@smithy/middleware-endpoint/dist-es/resolveEndpointConfig.js
  var resolveEndpointConfig = (input) => {
    const tls = input.tls ?? true;
    const { endpoint } = input;
    const customEndpointProvider = endpoint != null ? async () => toEndpointV1(await normalizeProvider(endpoint)()) : void 0;
    const isCustomEndpoint = !!endpoint;
    return {
      ...input,
      endpoint: customEndpointProvider,
      tls,
      isCustomEndpoint,
      useDualstackEndpoint: normalizeProvider(input.useDualstackEndpoint ?? false),
      useFipsEndpoint: normalizeProvider(input.useFipsEndpoint ?? false)
    };
  };

  // node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemeEndpointRuleSetPlugin.js
  var httpAuthSchemeEndpointRuleSetMiddlewareOptions = {
    step: "serialize",
    tags: ["HTTP_AUTH_SCHEME"],
    name: "httpAuthSchemeMiddleware",
    override: true,
    relation: "before",
    toMiddleware: endpointMiddlewareOptions.name
  };
  var getHttpAuthSchemeEndpointRuleSetPlugin = (config2, { httpAuthSchemeParametersProvider, identityProviderConfigProvider }) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(httpAuthSchemeMiddleware(config2, {
        httpAuthSchemeParametersProvider,
        identityProviderConfigProvider
      }), httpAuthSchemeEndpointRuleSetMiddlewareOptions);
    }
  });

  // node_modules/@smithy/core/dist-es/middleware-http-auth-scheme/getHttpAuthSchemePlugin.js
  var httpAuthSchemeMiddlewareOptions = {
    step: "serialize",
    tags: ["HTTP_AUTH_SCHEME"],
    name: "httpAuthSchemeMiddleware",
    override: true,
    relation: "before",
    toMiddleware: serializerMiddlewareOption.name
  };

  // node_modules/@smithy/core/dist-es/middleware-http-signing/httpSigningMiddleware.js
  var defaultErrorHandler = (signingProperties) => (error) => {
    throw error;
  };
  var defaultSuccessHandler = (httpResponse, signingProperties) => {
  };
  var httpSigningMiddleware = (config2) => (next, context) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) {
      return next(args);
    }
    const smithyContext = getSmithyContext(context);
    const scheme = smithyContext.selectedHttpAuthScheme;
    if (!scheme) {
      throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
    }
    const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
    const output = await next({
      ...args,
      request: await signer.sign(args.request, identity, signingProperties)
    }).catch((signer.errorHandler || defaultErrorHandler)(signingProperties));
    (signer.successHandler || defaultSuccessHandler)(output.response, signingProperties);
    return output;
  };

  // node_modules/@smithy/util-retry/dist-es/config.js
  var RETRY_MODES;
  (function(RETRY_MODES2) {
    RETRY_MODES2["STANDARD"] = "standard";
    RETRY_MODES2["ADAPTIVE"] = "adaptive";
  })(RETRY_MODES || (RETRY_MODES = {}));
  var DEFAULT_MAX_ATTEMPTS = 3;
  var DEFAULT_RETRY_MODE = RETRY_MODES.STANDARD;

  // node_modules/@smithy/service-error-classification/dist-es/constants.js
  var THROTTLING_ERROR_CODES = [
    "BandwidthLimitExceeded",
    "EC2ThrottledException",
    "LimitExceededException",
    "PriorRequestNotComplete",
    "ProvisionedThroughputExceededException",
    "RequestLimitExceeded",
    "RequestThrottled",
    "RequestThrottledException",
    "SlowDown",
    "ThrottledException",
    "Throttling",
    "ThrottlingException",
    "TooManyRequestsException",
    "TransactionInProgressException"
  ];
  var TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
  var TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
  var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];

  // node_modules/@smithy/service-error-classification/dist-es/index.js
  var isClockSkewCorrectedError = (error) => error.$metadata?.clockSkewCorrected;
  var isThrottlingError = (error) => error.$metadata?.httpStatusCode === 429 || THROTTLING_ERROR_CODES.includes(error.name) || error.$retryable?.throttling == true;
  var isTransientError = (error) => isClockSkewCorrectedError(error) || TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes(error?.code || "") || TRANSIENT_ERROR_STATUS_CODES.includes(error.$metadata?.httpStatusCode || 0);
  var isServerError = (error) => {
    if (error.$metadata?.httpStatusCode !== void 0) {
      const statusCode = error.$metadata.httpStatusCode;
      if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
        return true;
      }
      return false;
    }
    return false;
  };

  // node_modules/@smithy/util-retry/dist-es/DefaultRateLimiter.js
  var DefaultRateLimiter = class {
    constructor(options) {
      this.currentCapacity = 0;
      this.enabled = false;
      this.lastMaxRate = 0;
      this.measuredTxRate = 0;
      this.requestCount = 0;
      this.lastTimestamp = 0;
      this.timeWindow = 0;
      this.beta = options?.beta ?? 0.7;
      this.minCapacity = options?.minCapacity ?? 1;
      this.minFillRate = options?.minFillRate ?? 0.5;
      this.scaleConstant = options?.scaleConstant ?? 0.4;
      this.smooth = options?.smooth ?? 0.8;
      const currentTimeInSeconds = this.getCurrentTimeInSeconds();
      this.lastThrottleTime = currentTimeInSeconds;
      this.lastTxRateBucket = Math.floor(this.getCurrentTimeInSeconds());
      this.fillRate = this.minFillRate;
      this.maxCapacity = this.minCapacity;
    }
    getCurrentTimeInSeconds() {
      return Date.now() / 1e3;
    }
    async getSendToken() {
      return this.acquireTokenBucket(1);
    }
    async acquireTokenBucket(amount) {
      if (!this.enabled) {
        return;
      }
      this.refillTokenBucket();
      if (amount > this.currentCapacity) {
        const delay = (amount - this.currentCapacity) / this.fillRate * 1e3;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      this.currentCapacity = this.currentCapacity - amount;
    }
    refillTokenBucket() {
      const timestamp = this.getCurrentTimeInSeconds();
      if (!this.lastTimestamp) {
        this.lastTimestamp = timestamp;
        return;
      }
      const fillAmount = (timestamp - this.lastTimestamp) * this.fillRate;
      this.currentCapacity = Math.min(this.maxCapacity, this.currentCapacity + fillAmount);
      this.lastTimestamp = timestamp;
    }
    updateClientSendingRate(response) {
      let calculatedRate;
      this.updateMeasuredRate();
      if (isThrottlingError(response)) {
        const rateToUse = !this.enabled ? this.measuredTxRate : Math.min(this.measuredTxRate, this.fillRate);
        this.lastMaxRate = rateToUse;
        this.calculateTimeWindow();
        this.lastThrottleTime = this.getCurrentTimeInSeconds();
        calculatedRate = this.cubicThrottle(rateToUse);
        this.enableTokenBucket();
      } else {
        this.calculateTimeWindow();
        calculatedRate = this.cubicSuccess(this.getCurrentTimeInSeconds());
      }
      const newRate = Math.min(calculatedRate, 2 * this.measuredTxRate);
      this.updateTokenBucketRate(newRate);
    }
    calculateTimeWindow() {
      this.timeWindow = this.getPrecise(Math.pow(this.lastMaxRate * (1 - this.beta) / this.scaleConstant, 1 / 3));
    }
    cubicThrottle(rateToUse) {
      return this.getPrecise(rateToUse * this.beta);
    }
    cubicSuccess(timestamp) {
      return this.getPrecise(this.scaleConstant * Math.pow(timestamp - this.lastThrottleTime - this.timeWindow, 3) + this.lastMaxRate);
    }
    enableTokenBucket() {
      this.enabled = true;
    }
    updateTokenBucketRate(newRate) {
      this.refillTokenBucket();
      this.fillRate = Math.max(newRate, this.minFillRate);
      this.maxCapacity = Math.max(newRate, this.minCapacity);
      this.currentCapacity = Math.min(this.currentCapacity, this.maxCapacity);
    }
    updateMeasuredRate() {
      const t2 = this.getCurrentTimeInSeconds();
      const timeBucket = Math.floor(t2 * 2) / 2;
      this.requestCount++;
      if (timeBucket > this.lastTxRateBucket) {
        const currentRate = this.requestCount / (timeBucket - this.lastTxRateBucket);
        this.measuredTxRate = this.getPrecise(currentRate * this.smooth + this.measuredTxRate * (1 - this.smooth));
        this.requestCount = 0;
        this.lastTxRateBucket = timeBucket;
      }
    }
    getPrecise(num) {
      return parseFloat(num.toFixed(8));
    }
  };

  // node_modules/@smithy/util-retry/dist-es/constants.js
  var DEFAULT_RETRY_DELAY_BASE = 100;
  var MAXIMUM_RETRY_DELAY = 20 * 1e3;
  var THROTTLING_RETRY_DELAY_BASE = 500;
  var INITIAL_RETRY_TOKENS = 500;
  var RETRY_COST = 5;
  var TIMEOUT_RETRY_COST = 10;
  var NO_RETRY_INCREMENT = 1;
  var INVOCATION_ID_HEADER = "amz-sdk-invocation-id";
  var REQUEST_HEADER = "amz-sdk-request";

  // node_modules/@smithy/util-retry/dist-es/defaultRetryBackoffStrategy.js
  var getDefaultRetryBackoffStrategy = () => {
    let delayBase = DEFAULT_RETRY_DELAY_BASE;
    const computeNextBackoffDelay = (attempts) => {
      return Math.floor(Math.min(MAXIMUM_RETRY_DELAY, Math.random() * 2 ** attempts * delayBase));
    };
    const setDelayBase = (delay) => {
      delayBase = delay;
    };
    return {
      computeNextBackoffDelay,
      setDelayBase
    };
  };

  // node_modules/@smithy/util-retry/dist-es/defaultRetryToken.js
  var createDefaultRetryToken = ({ retryDelay, retryCount, retryCost }) => {
    const getRetryCount = () => retryCount;
    const getRetryDelay = () => Math.min(MAXIMUM_RETRY_DELAY, retryDelay);
    const getRetryCost = () => retryCost;
    return {
      getRetryCount,
      getRetryDelay,
      getRetryCost
    };
  };

  // node_modules/@smithy/util-retry/dist-es/StandardRetryStrategy.js
  var StandardRetryStrategy = class {
    constructor(maxAttempts) {
      this.maxAttempts = maxAttempts;
      this.mode = RETRY_MODES.STANDARD;
      this.capacity = INITIAL_RETRY_TOKENS;
      this.retryBackoffStrategy = getDefaultRetryBackoffStrategy();
      this.maxAttemptsProvider = typeof maxAttempts === "function" ? maxAttempts : async () => maxAttempts;
    }
    async acquireInitialRetryToken(retryTokenScope) {
      return createDefaultRetryToken({
        retryDelay: DEFAULT_RETRY_DELAY_BASE,
        retryCount: 0
      });
    }
    async refreshRetryTokenForRetry(token, errorInfo) {
      const maxAttempts = await this.getMaxAttempts();
      if (this.shouldRetry(token, errorInfo, maxAttempts)) {
        const errorType = errorInfo.errorType;
        this.retryBackoffStrategy.setDelayBase(errorType === "THROTTLING" ? THROTTLING_RETRY_DELAY_BASE : DEFAULT_RETRY_DELAY_BASE);
        const delayFromErrorType = this.retryBackoffStrategy.computeNextBackoffDelay(token.getRetryCount());
        const retryDelay = errorInfo.retryAfterHint ? Math.max(errorInfo.retryAfterHint.getTime() - Date.now() || 0, delayFromErrorType) : delayFromErrorType;
        const capacityCost = this.getCapacityCost(errorType);
        this.capacity -= capacityCost;
        return createDefaultRetryToken({
          retryDelay,
          retryCount: token.getRetryCount() + 1,
          retryCost: capacityCost
        });
      }
      throw new Error("No retry token available");
    }
    recordSuccess(token) {
      this.capacity = Math.max(INITIAL_RETRY_TOKENS, this.capacity + (token.getRetryCost() ?? NO_RETRY_INCREMENT));
    }
    getCapacity() {
      return this.capacity;
    }
    async getMaxAttempts() {
      try {
        return await this.maxAttemptsProvider();
      } catch (error) {
        console.warn(`Max attempts provider could not resolve. Using default of ${DEFAULT_MAX_ATTEMPTS}`);
        return DEFAULT_MAX_ATTEMPTS;
      }
    }
    shouldRetry(tokenToRenew, errorInfo, maxAttempts) {
      const attempts = tokenToRenew.getRetryCount() + 1;
      return attempts < maxAttempts && this.capacity >= this.getCapacityCost(errorInfo.errorType) && this.isRetryableError(errorInfo.errorType);
    }
    getCapacityCost(errorType) {
      return errorType === "TRANSIENT" ? TIMEOUT_RETRY_COST : RETRY_COST;
    }
    isRetryableError(errorType) {
      return errorType === "THROTTLING" || errorType === "TRANSIENT";
    }
  };

  // node_modules/@smithy/util-retry/dist-es/AdaptiveRetryStrategy.js
  var AdaptiveRetryStrategy = class {
    constructor(maxAttemptsProvider, options) {
      this.maxAttemptsProvider = maxAttemptsProvider;
      this.mode = RETRY_MODES.ADAPTIVE;
      const { rateLimiter } = options ?? {};
      this.rateLimiter = rateLimiter ?? new DefaultRateLimiter();
      this.standardRetryStrategy = new StandardRetryStrategy(maxAttemptsProvider);
    }
    async acquireInitialRetryToken(retryTokenScope) {
      await this.rateLimiter.getSendToken();
      return this.standardRetryStrategy.acquireInitialRetryToken(retryTokenScope);
    }
    async refreshRetryTokenForRetry(tokenToRenew, errorInfo) {
      this.rateLimiter.updateClientSendingRate(errorInfo);
      return this.standardRetryStrategy.refreshRetryTokenForRetry(tokenToRenew, errorInfo);
    }
    recordSuccess(token) {
      this.rateLimiter.updateClientSendingRate({});
      this.standardRetryStrategy.recordSuccess(token);
    }
  };

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i2 = 0; i2 < 256; ++i2) {
    byteToHex.push((i2 + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = {
    randomUUID
  };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    const rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i2 = 0; i2 < 16; ++i2) {
        buf[offset + i2] = rnds[i2];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // node_modules/@smithy/middleware-retry/dist-es/util.js
  var asSdkError = (error) => {
    if (error instanceof Error)
      return error;
    if (error instanceof Object)
      return Object.assign(new Error(), error);
    if (typeof error === "string")
      return new Error(error);
    return new Error(`AWS SDK error wrapper for ${error}`);
  };

  // node_modules/@smithy/middleware-retry/dist-es/configurations.js
  var resolveRetryConfig = (input) => {
    const { retryStrategy } = input;
    const maxAttempts = normalizeProvider(input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
    return {
      ...input,
      maxAttempts,
      retryStrategy: async () => {
        if (retryStrategy) {
          return retryStrategy;
        }
        const retryMode = await normalizeProvider(input.retryMode)();
        if (retryMode === RETRY_MODES.ADAPTIVE) {
          return new AdaptiveRetryStrategy(maxAttempts);
        }
        return new StandardRetryStrategy(maxAttempts);
      }
    };
  };

  // node_modules/@smithy/middleware-retry/dist-es/isStreamingPayload/isStreamingPayload.browser.js
  var isStreamingPayload = (request) => request?.body instanceof ReadableStream;

  // node_modules/@smithy/middleware-retry/dist-es/retryMiddleware.js
  var retryMiddleware = (options) => (next, context) => async (args) => {
    let retryStrategy = await options.retryStrategy();
    const maxAttempts = await options.maxAttempts();
    if (isRetryStrategyV2(retryStrategy)) {
      retryStrategy = retryStrategy;
      let retryToken = await retryStrategy.acquireInitialRetryToken(context["partition_id"]);
      let lastError = new Error();
      let attempts = 0;
      let totalRetryDelay = 0;
      const { request } = args;
      const isRequest = HttpRequest.isInstance(request);
      if (isRequest) {
        request.headers[INVOCATION_ID_HEADER] = v4_default();
      }
      while (true) {
        try {
          if (isRequest) {
            request.headers[REQUEST_HEADER] = `attempt=${attempts + 1}; max=${maxAttempts}`;
          }
          const { response, output } = await next(args);
          retryStrategy.recordSuccess(retryToken);
          output.$metadata.attempts = attempts + 1;
          output.$metadata.totalRetryDelay = totalRetryDelay;
          return { response, output };
        } catch (e2) {
          const retryErrorInfo = getRetryErrorInfo(e2);
          lastError = asSdkError(e2);
          if (isRequest && isStreamingPayload(request)) {
            (context.logger instanceof NoOpLogger ? console : context.logger)?.warn("An error was encountered in a non-retryable streaming request.");
            throw lastError;
          }
          try {
            retryToken = await retryStrategy.refreshRetryTokenForRetry(retryToken, retryErrorInfo);
          } catch (refreshError) {
            if (!lastError.$metadata) {
              lastError.$metadata = {};
            }
            lastError.$metadata.attempts = attempts + 1;
            lastError.$metadata.totalRetryDelay = totalRetryDelay;
            throw lastError;
          }
          attempts = retryToken.getRetryCount();
          const delay = retryToken.getRetryDelay();
          totalRetryDelay += delay;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    } else {
      retryStrategy = retryStrategy;
      if (retryStrategy?.mode)
        context.userAgent = [...context.userAgent || [], ["cfg/retry-mode", retryStrategy.mode]];
      return retryStrategy.retry(next, args);
    }
  };
  var isRetryStrategyV2 = (retryStrategy) => typeof retryStrategy.acquireInitialRetryToken !== "undefined" && typeof retryStrategy.refreshRetryTokenForRetry !== "undefined" && typeof retryStrategy.recordSuccess !== "undefined";
  var getRetryErrorInfo = (error) => {
    const errorInfo = {
      error,
      errorType: getRetryErrorType(error)
    };
    const retryAfterHint = getRetryAfterHint(error.$response);
    if (retryAfterHint) {
      errorInfo.retryAfterHint = retryAfterHint;
    }
    return errorInfo;
  };
  var getRetryErrorType = (error) => {
    if (isThrottlingError(error))
      return "THROTTLING";
    if (isTransientError(error))
      return "TRANSIENT";
    if (isServerError(error))
      return "SERVER_ERROR";
    return "CLIENT_ERROR";
  };
  var retryMiddlewareOptions = {
    name: "retryMiddleware",
    tags: ["RETRY"],
    step: "finalizeRequest",
    priority: "high",
    override: true
  };
  var getRetryPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(retryMiddleware(options), retryMiddlewareOptions);
    }
  });
  var getRetryAfterHint = (response) => {
    if (!HttpResponse.isInstance(response))
      return;
    const retryAfterHeaderName = Object.keys(response.headers).find((key) => key.toLowerCase() === "retry-after");
    if (!retryAfterHeaderName)
      return;
    const retryAfter = response.headers[retryAfterHeaderName];
    const retryAfterSeconds = Number(retryAfter);
    if (!Number.isNaN(retryAfterSeconds))
      return new Date(retryAfterSeconds * 1e3);
    const retryAfterDate = new Date(retryAfter);
    return retryAfterDate;
  };

  // node_modules/@smithy/core/dist-es/middleware-http-signing/getHttpSigningMiddleware.js
  var httpSigningMiddlewareOptions = {
    step: "finalizeRequest",
    tags: ["HTTP_SIGNING"],
    name: "httpSigningMiddleware",
    aliases: ["apiKeyMiddleware", "tokenMiddleware", "awsAuthMiddleware"],
    override: true,
    relation: "after",
    toMiddleware: retryMiddlewareOptions.name
  };
  var getHttpSigningPlugin = (config2) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(httpSigningMiddleware(config2), httpSigningMiddlewareOptions);
    }
  });

  // node_modules/@smithy/core/dist-es/util-identity-and-auth/DefaultIdentityProviderConfig.js
  var DefaultIdentityProviderConfig = class {
    constructor(config2) {
      this.authSchemes = /* @__PURE__ */ new Map();
      for (const [key, value] of Object.entries(config2)) {
        if (value !== void 0) {
          this.authSchemes.set(key, value);
        }
      }
    }
    getIdentityProvider(schemeId) {
      return this.authSchemes.get(schemeId);
    }
  };

  // node_modules/@smithy/core/dist-es/util-identity-and-auth/memoizeIdentityProvider.js
  var createIsIdentityExpiredFunction = (expirationMs) => (identity) => doesIdentityRequireRefresh(identity) && identity.expiration.getTime() - Date.now() < expirationMs;
  var EXPIRATION_MS = 3e5;
  var isIdentityExpired = createIsIdentityExpiredFunction(EXPIRATION_MS);
  var doesIdentityRequireRefresh = (identity) => identity.expiration !== void 0;
  var memoizeIdentityProvider = (provider, isExpired, requiresRefresh) => {
    if (provider === void 0) {
      return void 0;
    }
    const normalizedProvider = typeof provider !== "function" ? async () => Promise.resolve(provider) : provider;
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async (options) => {
      if (!pending) {
        pending = normalizedProvider(options);
      }
      try {
        resolved = await pending;
        hasResult = true;
        isConstant = false;
      } finally {
        pending = void 0;
      }
      return resolved;
    };
    if (isExpired === void 0) {
      return async (options) => {
        if (!hasResult || options?.forceRefresh) {
          resolved = await coalesceProvider(options);
        }
        return resolved;
      };
    }
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider(options);
      }
      if (isConstant) {
        return resolved;
      }
      if (!requiresRefresh(resolved)) {
        isConstant = true;
        return resolved;
      }
      if (isExpired(resolved)) {
        await coalesceProvider(options);
        return resolved;
      }
      return resolved;
    };
  };

  // node_modules/@smithy/core/dist-es/normalizeProvider.js
  var normalizeProvider2 = (input) => {
    if (typeof input === "function")
      return input;
    const promisified = Promise.resolve(input);
    return () => promisified;
  };

  // node_modules/@smithy/core/dist-es/protocols/requestBuilder.js
  function requestBuilder(input, context) {
    return new RequestBuilder(input, context);
  }
  var RequestBuilder = class {
    constructor(input, context) {
      this.input = input;
      this.context = context;
      this.query = {};
      this.method = "";
      this.headers = {};
      this.path = "";
      this.body = null;
      this.hostname = "";
      this.resolvePathStack = [];
    }
    async build() {
      const { hostname, protocol = "https", port, path: basePath } = await this.context.endpoint();
      this.path = basePath;
      for (const resolvePath of this.resolvePathStack) {
        resolvePath(this.path);
      }
      return new HttpRequest({
        protocol,
        hostname: this.hostname || hostname,
        port,
        method: this.method,
        path: this.path,
        query: this.query,
        body: this.body,
        headers: this.headers
      });
    }
    hn(hostname) {
      this.hostname = hostname;
      return this;
    }
    bp(uriLabel) {
      this.resolvePathStack.push((basePath) => {
        this.path = `${basePath?.endsWith("/") ? basePath.slice(0, -1) : basePath || ""}` + uriLabel;
      });
      return this;
    }
    p(memberName, labelValueProvider, uriLabel, isGreedyLabel) {
      this.resolvePathStack.push((path) => {
        this.path = resolvedPath(path, this.input, memberName, labelValueProvider, uriLabel, isGreedyLabel);
      });
      return this;
    }
    h(headers) {
      this.headers = headers;
      return this;
    }
    q(query) {
      this.query = query;
      return this;
    }
    b(body) {
      this.body = body;
      return this;
    }
    m(method) {
      this.method = method;
      return this;
    }
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/signS3Express.js
  var signS3Express = async (s3ExpressIdentity, signingOptions, request, sigV4MultiRegionSigner) => {
    const signedRequest = await sigV4MultiRegionSigner.signWithCredentials(request, s3ExpressIdentity, {});
    if (signedRequest.headers["X-Amz-Security-Token"] || signedRequest.headers["x-amz-security-token"]) {
      throw new Error("X-Amz-Security-Token must not be set for s3-express requests.");
    }
    return signedRequest;
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3-express/functions/s3ExpressHttpSigningMiddleware.js
  var defaultErrorHandler2 = (signingProperties) => (error) => {
    throw error;
  };
  var defaultSuccessHandler2 = (httpResponse, signingProperties) => {
  };
  var s3ExpressHttpSigningMiddleware = (config2) => (next, context) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) {
      return next(args);
    }
    const smithyContext = getSmithyContext(context);
    const scheme = smithyContext.selectedHttpAuthScheme;
    if (!scheme) {
      throw new Error(`No HttpAuthScheme was selected: unable to sign request`);
    }
    const { httpAuthOption: { signingProperties = {} }, identity, signer } = scheme;
    let request;
    if (context.s3ExpressIdentity) {
      request = await signS3Express(context.s3ExpressIdentity, signingProperties, args.request, await config2.signer());
    } else {
      request = await signer.sign(args.request, identity, signingProperties);
    }
    const output = await next({
      ...args,
      request
    }).catch((signer.errorHandler || defaultErrorHandler2)(signingProperties));
    (signer.successHandler || defaultSuccessHandler2)(output.response, signingProperties);
    return output;
  };
  var getS3ExpressHttpSigningPlugin = (config2) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(s3ExpressHttpSigningMiddleware(config2), httpSigningMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/s3Configuration.js
  var resolveS3Config = (input, { session }) => {
    const [s3ClientProvider, CreateSessionCommandCtor] = session;
    return {
      ...input,
      forcePathStyle: input.forcePathStyle ?? false,
      useAccelerateEndpoint: input.useAccelerateEndpoint ?? false,
      disableMultiregionAccessPoints: input.disableMultiregionAccessPoints ?? false,
      followRegionRedirects: input.followRegionRedirects ?? false,
      s3ExpressIdentityProvider: input.s3ExpressIdentityProvider ?? new S3ExpressIdentityProviderImpl(async (key) => s3ClientProvider().send(new CreateSessionCommandCtor({
        Bucket: key,
        SessionMode: "ReadWrite"
      }))),
      bucketEndpoint: input.bucketEndpoint ?? false
    };
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/throw-200-exceptions.js
  var THROW_IF_EMPTY_BODY = {
    CopyObjectCommand: true,
    UploadPartCopyCommand: true,
    CompleteMultipartUploadCommand: true
  };
  var MAX_BYTES_TO_INSPECT = 3e3;
  var throw200ExceptionsMiddleware = (config2) => (next, context) => async (args) => {
    const result = await next(args);
    const { response } = result;
    if (!HttpResponse.isInstance(response)) {
      return result;
    }
    const { statusCode, body: sourceBody } = response;
    if (statusCode < 200 || statusCode >= 300) {
      return result;
    }
    let bodyCopy = sourceBody;
    let body = sourceBody;
    if (sourceBody && typeof sourceBody === "object" && !(sourceBody instanceof Uint8Array)) {
      [bodyCopy, body] = await splitStream(sourceBody);
    }
    response.body = body;
    const bodyBytes = await collectBody2(bodyCopy, {
      streamCollector: async (stream) => {
        return headStream(stream, MAX_BYTES_TO_INSPECT);
      }
    });
    if (typeof bodyCopy?.destroy === "function") {
      bodyCopy.destroy();
    }
    const bodyStringTail = config2.utf8Encoder(bodyBytes.subarray(bodyBytes.length - 16));
    if (bodyBytes.length === 0 && THROW_IF_EMPTY_BODY[context.commandName]) {
      const err = new Error("S3 aborted request");
      err.name = "InternalError";
      throw err;
    }
    if (bodyStringTail && bodyStringTail.endsWith("</Error>")) {
      response.statusCode = 400;
    }
    return result;
  };
  var collectBody2 = (streamBody = new Uint8Array(), context) => {
    if (streamBody instanceof Uint8Array) {
      return Promise.resolve(streamBody);
    }
    return context.streamCollector(streamBody) || Promise.resolve(new Uint8Array());
  };
  var throw200ExceptionsMiddlewareOptions = {
    relation: "after",
    toMiddleware: "deserializerMiddleware",
    tags: ["THROW_200_EXCEPTIONS", "S3"],
    name: "throw200ExceptionsMiddleware",
    override: true
  };
  var getThrow200ExceptionsPlugin = (config2) => ({
    applyToStack: (clientStack) => {
      clientStack.addRelativeTo(throw200ExceptionsMiddleware(config2), throw200ExceptionsMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/util-arn-parser/dist-es/index.js
  var validate = (str2) => typeof str2 === "string" && str2.indexOf("arn:") === 0 && str2.split(":").length >= 6;

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/bucket-endpoint-middleware.js
  function bucketEndpointMiddleware(options) {
    return (next, context) => async (args) => {
      if (options.bucketEndpoint) {
        const endpoint = context.endpointV2;
        if (endpoint) {
          const bucket = args.input.Bucket;
          if (typeof bucket === "string") {
            try {
              const bucketEndpointUrl = new URL(bucket);
              endpoint.url = bucketEndpointUrl;
            } catch (e2) {
              const warning = `@aws-sdk/middleware-sdk-s3: bucketEndpoint=true was set but Bucket=${bucket} could not be parsed as URL.`;
              if (context.logger?.constructor?.name === "NoOpLogger") {
                console.warn(warning);
              } else {
                context.logger?.warn?.(warning);
              }
              throw e2;
            }
          }
        }
      }
      return next(args);
    };
  }
  var bucketEndpointMiddlewareOptions = {
    name: "bucketEndpointMiddleware",
    override: true,
    relation: "after",
    toMiddleware: "endpointV2Middleware"
  };

  // node_modules/@aws-sdk/middleware-sdk-s3/dist-es/validate-bucket-name.js
  function validateBucketNameMiddleware({ bucketEndpoint }) {
    return (next) => async (args) => {
      const { input: { Bucket } } = args;
      if (!bucketEndpoint && typeof Bucket === "string" && !validate(Bucket) && Bucket.indexOf("/") >= 0) {
        const err = new Error(`Bucket name shouldn't contain '/', received '${Bucket}'`);
        err.name = "InvalidBucketName";
        throw err;
      }
      return next({ ...args });
    };
  }
  var validateBucketNameMiddlewareOptions = {
    step: "initialize",
    tags: ["VALIDATE_BUCKET_NAME"],
    name: "validateBucketNameMiddleware",
    override: true
  };
  var getValidateBucketNamePlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(validateBucketNameMiddleware(options), validateBucketNameMiddlewareOptions);
      clientStack.addRelativeTo(bucketEndpointMiddleware(options), bucketEndpointMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/middleware-user-agent/dist-es/configurations.js
  function resolveUserAgentConfig(input) {
    return {
      ...input,
      customUserAgent: typeof input.customUserAgent === "string" ? [[input.customUserAgent]] : input.customUserAgent
    };
  }

  // node_modules/@smithy/util-endpoints/dist-es/lib/isIpAddress.js
  var IP_V4_REGEX = new RegExp(`^(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]\\d|\\d)){3}$`);
  var isIpAddress = (value) => IP_V4_REGEX.test(value) || value.startsWith("[") && value.endsWith("]");

  // node_modules/@smithy/util-endpoints/dist-es/lib/isValidHostLabel.js
  var VALID_HOST_LABEL_REGEX = new RegExp(`^(?!.*-$)(?!-)[a-zA-Z0-9-]{1,63}$`);
  var isValidHostLabel = (value, allowSubDomains = false) => {
    if (!allowSubDomains) {
      return VALID_HOST_LABEL_REGEX.test(value);
    }
    const labels = value.split(".");
    for (const label of labels) {
      if (!isValidHostLabel(label)) {
        return false;
      }
    }
    return true;
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/customEndpointFunctions.js
  var customEndpointFunctions = {};

  // node_modules/@smithy/util-endpoints/dist-es/debug/debugId.js
  var debugId = "endpoints";

  // node_modules/@smithy/util-endpoints/dist-es/debug/toDebugString.js
  function toDebugString(input) {
    if (typeof input !== "object" || input == null) {
      return input;
    }
    if ("ref" in input) {
      return `$${toDebugString(input.ref)}`;
    }
    if ("fn" in input) {
      return `${input.fn}(${(input.argv || []).map(toDebugString).join(", ")})`;
    }
    return JSON.stringify(input, null, 2);
  }

  // node_modules/@smithy/util-endpoints/dist-es/types/EndpointError.js
  var EndpointError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "EndpointError";
    }
  };

  // node_modules/@smithy/util-endpoints/dist-es/lib/booleanEquals.js
  var booleanEquals = (value1, value2) => value1 === value2;

  // node_modules/@smithy/util-endpoints/dist-es/lib/getAttrPathList.js
  var getAttrPathList = (path) => {
    const parts = path.split(".");
    const pathList = [];
    for (const part of parts) {
      const squareBracketIndex = part.indexOf("[");
      if (squareBracketIndex !== -1) {
        if (part.indexOf("]") !== part.length - 1) {
          throw new EndpointError(`Path: '${path}' does not end with ']'`);
        }
        const arrayIndex = part.slice(squareBracketIndex + 1, -1);
        if (Number.isNaN(parseInt(arrayIndex))) {
          throw new EndpointError(`Invalid array index: '${arrayIndex}' in path: '${path}'`);
        }
        if (squareBracketIndex !== 0) {
          pathList.push(part.slice(0, squareBracketIndex));
        }
        pathList.push(arrayIndex);
      } else {
        pathList.push(part);
      }
    }
    return pathList;
  };

  // node_modules/@smithy/util-endpoints/dist-es/lib/getAttr.js
  var getAttr = (value, path) => getAttrPathList(path).reduce((acc, index) => {
    if (typeof acc !== "object") {
      throw new EndpointError(`Index '${index}' in '${path}' not found in '${JSON.stringify(value)}'`);
    } else if (Array.isArray(acc)) {
      return acc[parseInt(index)];
    }
    return acc[index];
  }, value);

  // node_modules/@smithy/util-endpoints/dist-es/lib/isSet.js
  var isSet = (value) => value != null;

  // node_modules/@smithy/util-endpoints/dist-es/lib/not.js
  var not = (value) => !value;

  // node_modules/@smithy/util-endpoints/dist-es/lib/parseURL.js
  var DEFAULT_PORTS = {
    [EndpointURLScheme.HTTP]: 80,
    [EndpointURLScheme.HTTPS]: 443
  };
  var parseURL = (value) => {
    const whatwgURL = (() => {
      try {
        if (value instanceof URL) {
          return value;
        }
        if (typeof value === "object" && "hostname" in value) {
          const { hostname: hostname2, port, protocol: protocol2 = "", path = "", query = {} } = value;
          const url = new URL(`${protocol2}//${hostname2}${port ? `:${port}` : ""}${path}`);
          url.search = Object.entries(query).map(([k2, v2]) => `${k2}=${v2}`).join("&");
          return url;
        }
        return new URL(value);
      } catch (error) {
        return null;
      }
    })();
    if (!whatwgURL) {
      console.error(`Unable to parse ${JSON.stringify(value)} as a whatwg URL.`);
      return null;
    }
    const urlString = whatwgURL.href;
    const { host, hostname, pathname, protocol, search } = whatwgURL;
    if (search) {
      return null;
    }
    const scheme = protocol.slice(0, -1);
    if (!Object.values(EndpointURLScheme).includes(scheme)) {
      return null;
    }
    const isIp = isIpAddress(hostname);
    const inputContainsDefaultPort = urlString.includes(`${host}:${DEFAULT_PORTS[scheme]}`) || typeof value === "string" && value.includes(`${host}:${DEFAULT_PORTS[scheme]}`);
    const authority = `${host}${inputContainsDefaultPort ? `:${DEFAULT_PORTS[scheme]}` : ``}`;
    return {
      scheme,
      authority,
      path: pathname,
      normalizedPath: pathname.endsWith("/") ? pathname : `${pathname}/`,
      isIp
    };
  };

  // node_modules/@smithy/util-endpoints/dist-es/lib/stringEquals.js
  var stringEquals = (value1, value2) => value1 === value2;

  // node_modules/@smithy/util-endpoints/dist-es/lib/substring.js
  var substring = (input, start, stop, reverse) => {
    if (start >= stop || input.length < stop) {
      return null;
    }
    if (!reverse) {
      return input.substring(start, stop);
    }
    return input.substring(input.length - stop, input.length - start);
  };

  // node_modules/@smithy/util-endpoints/dist-es/lib/uriEncode.js
  var uriEncode = (value) => encodeURIComponent(value).replace(/[!*'()]/g, (c2) => `%${c2.charCodeAt(0).toString(16).toUpperCase()}`);

  // node_modules/@smithy/util-endpoints/dist-es/utils/endpointFunctions.js
  var endpointFunctions = {
    booleanEquals,
    getAttr,
    isSet,
    isValidHostLabel,
    not,
    parseURL,
    stringEquals,
    substring,
    uriEncode
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateTemplate.js
  var evaluateTemplate = (template, options) => {
    const evaluatedTemplateArr = [];
    const templateContext = {
      ...options.endpointParams,
      ...options.referenceRecord
    };
    let currentIndex = 0;
    while (currentIndex < template.length) {
      const openingBraceIndex = template.indexOf("{", currentIndex);
      if (openingBraceIndex === -1) {
        evaluatedTemplateArr.push(template.slice(currentIndex));
        break;
      }
      evaluatedTemplateArr.push(template.slice(currentIndex, openingBraceIndex));
      const closingBraceIndex = template.indexOf("}", openingBraceIndex);
      if (closingBraceIndex === -1) {
        evaluatedTemplateArr.push(template.slice(openingBraceIndex));
        break;
      }
      if (template[openingBraceIndex + 1] === "{" && template[closingBraceIndex + 1] === "}") {
        evaluatedTemplateArr.push(template.slice(openingBraceIndex + 1, closingBraceIndex));
        currentIndex = closingBraceIndex + 2;
      }
      const parameterName = template.substring(openingBraceIndex + 1, closingBraceIndex);
      if (parameterName.includes("#")) {
        const [refName, attrName] = parameterName.split("#");
        evaluatedTemplateArr.push(getAttr(templateContext[refName], attrName));
      } else {
        evaluatedTemplateArr.push(templateContext[parameterName]);
      }
      currentIndex = closingBraceIndex + 1;
    }
    return evaluatedTemplateArr.join("");
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/getReferenceValue.js
  var getReferenceValue = ({ ref }, options) => {
    const referenceRecord = {
      ...options.endpointParams,
      ...options.referenceRecord
    };
    return referenceRecord[ref];
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateExpression.js
  var evaluateExpression = (obj, keyName, options) => {
    if (typeof obj === "string") {
      return evaluateTemplate(obj, options);
    } else if (obj["fn"]) {
      return callFunction(obj, options);
    } else if (obj["ref"]) {
      return getReferenceValue(obj, options);
    }
    throw new EndpointError(`'${keyName}': ${String(obj)} is not a string, function or reference.`);
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/callFunction.js
  var callFunction = ({ fn, argv: argv2 }, options) => {
    const evaluatedArgs = argv2.map((arg) => ["boolean", "number"].includes(typeof arg) ? arg : evaluateExpression(arg, "arg", options));
    const fnSegments = fn.split(".");
    if (fnSegments[0] in customEndpointFunctions && fnSegments[1] != null) {
      return customEndpointFunctions[fnSegments[0]][fnSegments[1]](...evaluatedArgs);
    }
    return endpointFunctions[fn](...evaluatedArgs);
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateCondition.js
  var evaluateCondition = ({ assign, ...fnArgs }, options) => {
    if (assign && assign in options.referenceRecord) {
      throw new EndpointError(`'${assign}' is already defined in Reference Record.`);
    }
    const value = callFunction(fnArgs, options);
    options.logger?.debug?.(`${debugId} evaluateCondition: ${toDebugString(fnArgs)} = ${toDebugString(value)}`);
    return {
      result: value === "" ? true : !!value,
      ...assign != null && { toAssign: { name: assign, value } }
    };
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateConditions.js
  var evaluateConditions = (conditions = [], options) => {
    const conditionsReferenceRecord = {};
    for (const condition of conditions) {
      const { result, toAssign } = evaluateCondition(condition, {
        ...options,
        referenceRecord: {
          ...options.referenceRecord,
          ...conditionsReferenceRecord
        }
      });
      if (!result) {
        return { result };
      }
      if (toAssign) {
        conditionsReferenceRecord[toAssign.name] = toAssign.value;
        options.logger?.debug?.(`${debugId} assign: ${toAssign.name} := ${toDebugString(toAssign.value)}`);
      }
    }
    return { result: true, referenceRecord: conditionsReferenceRecord };
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointHeaders.js
  var getEndpointHeaders = (headers, options) => Object.entries(headers).reduce((acc, [headerKey, headerVal]) => ({
    ...acc,
    [headerKey]: headerVal.map((headerValEntry) => {
      const processedExpr = evaluateExpression(headerValEntry, "Header value entry", options);
      if (typeof processedExpr !== "string") {
        throw new EndpointError(`Header '${headerKey}' value '${processedExpr}' is not a string`);
      }
      return processedExpr;
    })
  }), {});

  // node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointProperty.js
  var getEndpointProperty = (property, options) => {
    if (Array.isArray(property)) {
      return property.map((propertyEntry) => getEndpointProperty(propertyEntry, options));
    }
    switch (typeof property) {
      case "string":
        return evaluateTemplate(property, options);
      case "object":
        if (property === null) {
          throw new EndpointError(`Unexpected endpoint property: ${property}`);
        }
        return getEndpointProperties(property, options);
      case "boolean":
        return property;
      default:
        throw new EndpointError(`Unexpected endpoint property type: ${typeof property}`);
    }
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointProperties.js
  var getEndpointProperties = (properties, options) => Object.entries(properties).reduce((acc, [propertyKey, propertyVal]) => ({
    ...acc,
    [propertyKey]: getEndpointProperty(propertyVal, options)
  }), {});

  // node_modules/@smithy/util-endpoints/dist-es/utils/getEndpointUrl.js
  var getEndpointUrl = (endpointUrl, options) => {
    const expression = evaluateExpression(endpointUrl, "Endpoint URL", options);
    if (typeof expression === "string") {
      try {
        return new URL(expression);
      } catch (error) {
        console.error(`Failed to construct URL with ${expression}`, error);
        throw error;
      }
    }
    throw new EndpointError(`Endpoint URL must be a string, got ${typeof expression}`);
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateEndpointRule.js
  var evaluateEndpointRule = (endpointRule, options) => {
    const { conditions, endpoint } = endpointRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    const endpointRuleOptions = {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    };
    const { url, properties, headers } = endpoint;
    options.logger?.debug?.(`${debugId} Resolving endpoint from template: ${toDebugString(endpoint)}`);
    return {
      ...headers != void 0 && {
        headers: getEndpointHeaders(headers, endpointRuleOptions)
      },
      ...properties != void 0 && {
        properties: getEndpointProperties(properties, endpointRuleOptions)
      },
      url: getEndpointUrl(url, endpointRuleOptions)
    };
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateErrorRule.js
  var evaluateErrorRule = (errorRule, options) => {
    const { conditions, error } = errorRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    throw new EndpointError(evaluateExpression(error, "Error", {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    }));
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateTreeRule.js
  var evaluateTreeRule = (treeRule, options) => {
    const { conditions, rules } = treeRule;
    const { result, referenceRecord } = evaluateConditions(conditions, options);
    if (!result) {
      return;
    }
    return evaluateRules(rules, {
      ...options,
      referenceRecord: { ...options.referenceRecord, ...referenceRecord }
    });
  };

  // node_modules/@smithy/util-endpoints/dist-es/utils/evaluateRules.js
  var evaluateRules = (rules, options) => {
    for (const rule of rules) {
      if (rule.type === "endpoint") {
        const endpointOrUndefined = evaluateEndpointRule(rule, options);
        if (endpointOrUndefined) {
          return endpointOrUndefined;
        }
      } else if (rule.type === "error") {
        evaluateErrorRule(rule, options);
      } else if (rule.type === "tree") {
        const endpointOrUndefined = evaluateTreeRule(rule, options);
        if (endpointOrUndefined) {
          return endpointOrUndefined;
        }
      } else {
        throw new EndpointError(`Unknown endpoint rule: ${rule}`);
      }
    }
    throw new EndpointError(`Rules evaluation failed`);
  };

  // node_modules/@smithy/util-endpoints/dist-es/resolveEndpoint.js
  var resolveEndpoint = (ruleSetObject, options) => {
    const { endpointParams, logger: logger2 } = options;
    const { parameters, rules } = ruleSetObject;
    options.logger?.debug?.(`${debugId} Initial EndpointParams: ${toDebugString(endpointParams)}`);
    const paramsWithDefault = Object.entries(parameters).filter(([, v2]) => v2.default != null).map(([k2, v2]) => [k2, v2.default]);
    if (paramsWithDefault.length > 0) {
      for (const [paramKey, paramDefaultValue] of paramsWithDefault) {
        endpointParams[paramKey] = endpointParams[paramKey] ?? paramDefaultValue;
      }
    }
    const requiredParams = Object.entries(parameters).filter(([, v2]) => v2.required).map(([k2]) => k2);
    for (const requiredParam of requiredParams) {
      if (endpointParams[requiredParam] == null) {
        throw new EndpointError(`Missing required parameter: '${requiredParam}'`);
      }
    }
    const endpoint = evaluateRules(rules, { endpointParams, logger: logger2, referenceRecord: {} });
    if (options.endpointParams?.Endpoint) {
      try {
        const givenEndpoint = new URL(options.endpointParams.Endpoint);
        const { protocol, port } = givenEndpoint;
        endpoint.url.protocol = protocol;
        endpoint.url.port = port;
      } catch (e2) {
      }
    }
    options.logger?.debug?.(`${debugId} Resolved endpoint: ${toDebugString(endpoint)}`);
    return endpoint;
  };

  // node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/isVirtualHostableS3Bucket.js
  var isVirtualHostableS3Bucket = (value, allowSubDomains = false) => {
    if (allowSubDomains) {
      for (const label of value.split(".")) {
        if (!isVirtualHostableS3Bucket(label)) {
          return false;
        }
      }
      return true;
    }
    if (!isValidHostLabel(value)) {
      return false;
    }
    if (value.length < 3 || value.length > 63) {
      return false;
    }
    if (value !== value.toLowerCase()) {
      return false;
    }
    if (isIpAddress(value)) {
      return false;
    }
    return true;
  };

  // node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/parseArn.js
  var parseArn = (value) => {
    const segments = value.split(":");
    if (segments.length < 6)
      return null;
    const [arn, partition2, service, region, accountId, ...resourceId] = segments;
    if (arn !== "arn" || partition2 === "" || service === "" || resourceId[0] === "")
      return null;
    return {
      partition: partition2,
      service,
      region,
      accountId,
      resourceId: resourceId[0].includes("/") ? resourceId[0].split("/") : resourceId
    };
  };

  // node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partitions.json
  var partitions_default = {
    partitions: [{
      id: "aws",
      outputs: {
        dnsSuffix: "amazonaws.com",
        dualStackDnsSuffix: "api.aws",
        implicitGlobalRegion: "us-east-1",
        name: "aws",
        supportsDualStack: true,
        supportsFIPS: true
      },
      regionRegex: "^(us|eu|ap|sa|ca|me|af|il)\\-\\w+\\-\\d+$",
      regions: {
        "af-south-1": {
          description: "Africa (Cape Town)"
        },
        "ap-east-1": {
          description: "Asia Pacific (Hong Kong)"
        },
        "ap-northeast-1": {
          description: "Asia Pacific (Tokyo)"
        },
        "ap-northeast-2": {
          description: "Asia Pacific (Seoul)"
        },
        "ap-northeast-3": {
          description: "Asia Pacific (Osaka)"
        },
        "ap-south-1": {
          description: "Asia Pacific (Mumbai)"
        },
        "ap-south-2": {
          description: "Asia Pacific (Hyderabad)"
        },
        "ap-southeast-1": {
          description: "Asia Pacific (Singapore)"
        },
        "ap-southeast-2": {
          description: "Asia Pacific (Sydney)"
        },
        "ap-southeast-3": {
          description: "Asia Pacific (Jakarta)"
        },
        "ap-southeast-4": {
          description: "Asia Pacific (Melbourne)"
        },
        "aws-global": {
          description: "AWS Standard global region"
        },
        "ca-central-1": {
          description: "Canada (Central)"
        },
        "ca-west-1": {
          description: "Canada West (Calgary)"
        },
        "eu-central-1": {
          description: "Europe (Frankfurt)"
        },
        "eu-central-2": {
          description: "Europe (Zurich)"
        },
        "eu-north-1": {
          description: "Europe (Stockholm)"
        },
        "eu-south-1": {
          description: "Europe (Milan)"
        },
        "eu-south-2": {
          description: "Europe (Spain)"
        },
        "eu-west-1": {
          description: "Europe (Ireland)"
        },
        "eu-west-2": {
          description: "Europe (London)"
        },
        "eu-west-3": {
          description: "Europe (Paris)"
        },
        "il-central-1": {
          description: "Israel (Tel Aviv)"
        },
        "me-central-1": {
          description: "Middle East (UAE)"
        },
        "me-south-1": {
          description: "Middle East (Bahrain)"
        },
        "sa-east-1": {
          description: "South America (Sao Paulo)"
        },
        "us-east-1": {
          description: "US East (N. Virginia)"
        },
        "us-east-2": {
          description: "US East (Ohio)"
        },
        "us-west-1": {
          description: "US West (N. California)"
        },
        "us-west-2": {
          description: "US West (Oregon)"
        }
      }
    }, {
      id: "aws-cn",
      outputs: {
        dnsSuffix: "amazonaws.com.cn",
        dualStackDnsSuffix: "api.amazonwebservices.com.cn",
        implicitGlobalRegion: "cn-northwest-1",
        name: "aws-cn",
        supportsDualStack: true,
        supportsFIPS: true
      },
      regionRegex: "^cn\\-\\w+\\-\\d+$",
      regions: {
        "aws-cn-global": {
          description: "AWS China global region"
        },
        "cn-north-1": {
          description: "China (Beijing)"
        },
        "cn-northwest-1": {
          description: "China (Ningxia)"
        }
      }
    }, {
      id: "aws-us-gov",
      outputs: {
        dnsSuffix: "amazonaws.com",
        dualStackDnsSuffix: "api.aws",
        implicitGlobalRegion: "us-gov-west-1",
        name: "aws-us-gov",
        supportsDualStack: true,
        supportsFIPS: true
      },
      regionRegex: "^us\\-gov\\-\\w+\\-\\d+$",
      regions: {
        "aws-us-gov-global": {
          description: "AWS GovCloud (US) global region"
        },
        "us-gov-east-1": {
          description: "AWS GovCloud (US-East)"
        },
        "us-gov-west-1": {
          description: "AWS GovCloud (US-West)"
        }
      }
    }, {
      id: "aws-iso",
      outputs: {
        dnsSuffix: "c2s.ic.gov",
        dualStackDnsSuffix: "c2s.ic.gov",
        implicitGlobalRegion: "us-iso-east-1",
        name: "aws-iso",
        supportsDualStack: false,
        supportsFIPS: true
      },
      regionRegex: "^us\\-iso\\-\\w+\\-\\d+$",
      regions: {
        "aws-iso-global": {
          description: "AWS ISO (US) global region"
        },
        "us-iso-east-1": {
          description: "US ISO East"
        },
        "us-iso-west-1": {
          description: "US ISO WEST"
        }
      }
    }, {
      id: "aws-iso-b",
      outputs: {
        dnsSuffix: "sc2s.sgov.gov",
        dualStackDnsSuffix: "sc2s.sgov.gov",
        implicitGlobalRegion: "us-isob-east-1",
        name: "aws-iso-b",
        supportsDualStack: false,
        supportsFIPS: true
      },
      regionRegex: "^us\\-isob\\-\\w+\\-\\d+$",
      regions: {
        "aws-iso-b-global": {
          description: "AWS ISOB (US) global region"
        },
        "us-isob-east-1": {
          description: "US ISOB East (Ohio)"
        }
      }
    }, {
      id: "aws-iso-e",
      outputs: {
        dnsSuffix: "cloud.adc-e.uk",
        dualStackDnsSuffix: "cloud.adc-e.uk",
        implicitGlobalRegion: "eu-isoe-west-1",
        name: "aws-iso-e",
        supportsDualStack: false,
        supportsFIPS: true
      },
      regionRegex: "^eu\\-isoe\\-\\w+\\-\\d+$",
      regions: {
        "eu-isoe-west-1": {
          description: "EU ISOE West"
        }
      }
    }, {
      id: "aws-iso-f",
      outputs: {
        dnsSuffix: "csp.hci.ic.gov",
        dualStackDnsSuffix: "csp.hci.ic.gov",
        implicitGlobalRegion: "us-isof-south-1",
        name: "aws-iso-f",
        supportsDualStack: false,
        supportsFIPS: true
      },
      regionRegex: "^us\\-isof\\-\\w+\\-\\d+$",
      regions: {}
    }],
    version: "1.1"
  };

  // node_modules/@aws-sdk/util-endpoints/dist-es/lib/aws/partition.js
  var selectedPartitionsInfo = partitions_default;
  var selectedUserAgentPrefix = "";
  var partition = (value) => {
    const { partitions } = selectedPartitionsInfo;
    for (const partition2 of partitions) {
      const { regions, outputs } = partition2;
      for (const [region, regionData] of Object.entries(regions)) {
        if (region === value) {
          return {
            ...outputs,
            ...regionData
          };
        }
      }
    }
    for (const partition2 of partitions) {
      const { regionRegex, outputs } = partition2;
      if (new RegExp(regionRegex).test(value)) {
        return {
          ...outputs
        };
      }
    }
    const DEFAULT_PARTITION = partitions.find((partition2) => partition2.id === "aws");
    if (!DEFAULT_PARTITION) {
      throw new Error("Provided region was not found in the partition array or regex, and default partition with id 'aws' doesn't exist.");
    }
    return {
      ...DEFAULT_PARTITION.outputs
    };
  };
  var getUserAgentPrefix = () => selectedUserAgentPrefix;

  // node_modules/@aws-sdk/util-endpoints/dist-es/aws.js
  var awsEndpointFunctions = {
    isVirtualHostableS3Bucket,
    parseArn,
    partition
  };
  customEndpointFunctions.aws = awsEndpointFunctions;

  // node_modules/@aws-sdk/middleware-user-agent/dist-es/constants.js
  var USER_AGENT = "user-agent";
  var X_AMZ_USER_AGENT = "x-amz-user-agent";
  var SPACE = " ";
  var UA_NAME_SEPARATOR = "/";
  var UA_NAME_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w]/g;
  var UA_VALUE_ESCAPE_REGEX = /[^\!\$\%\&\'\*\+\-\.\^\_\`\|\~\d\w\#]/g;
  var UA_ESCAPE_CHAR = "-";

  // node_modules/@aws-sdk/middleware-user-agent/dist-es/user-agent-middleware.js
  var userAgentMiddleware = (options) => (next, context) => async (args) => {
    const { request } = args;
    if (!HttpRequest.isInstance(request))
      return next(args);
    const { headers } = request;
    const userAgent = context?.userAgent?.map(escapeUserAgent) || [];
    const defaultUserAgent2 = (await options.defaultUserAgentProvider()).map(escapeUserAgent);
    const customUserAgent = options?.customUserAgent?.map(escapeUserAgent) || [];
    const prefix = getUserAgentPrefix();
    const sdkUserAgentValue = (prefix ? [prefix] : []).concat([...defaultUserAgent2, ...userAgent, ...customUserAgent]).join(SPACE);
    const normalUAValue = [
      ...defaultUserAgent2.filter((section) => section.startsWith("aws-sdk-")),
      ...customUserAgent
    ].join(SPACE);
    if (options.runtime !== "browser") {
      if (normalUAValue) {
        headers[X_AMZ_USER_AGENT] = headers[X_AMZ_USER_AGENT] ? `${headers[USER_AGENT]} ${normalUAValue}` : normalUAValue;
      }
      headers[USER_AGENT] = sdkUserAgentValue;
    } else {
      headers[X_AMZ_USER_AGENT] = sdkUserAgentValue;
    }
    return next({
      ...args,
      request
    });
  };
  var escapeUserAgent = (userAgentPair) => {
    const name = userAgentPair[0].split(UA_NAME_SEPARATOR).map((part) => part.replace(UA_NAME_ESCAPE_REGEX, UA_ESCAPE_CHAR)).join(UA_NAME_SEPARATOR);
    const version2 = userAgentPair[1]?.replace(UA_VALUE_ESCAPE_REGEX, UA_ESCAPE_CHAR);
    const prefixSeparatorIndex = name.indexOf(UA_NAME_SEPARATOR);
    const prefix = name.substring(0, prefixSeparatorIndex);
    let uaName = name.substring(prefixSeparatorIndex + 1);
    if (prefix === "api") {
      uaName = uaName.toLowerCase();
    }
    return [prefix, uaName, version2].filter((item) => item && item.length > 0).reduce((acc, item, index) => {
      switch (index) {
        case 0:
          return item;
        case 1:
          return `${acc}/${item}`;
        default:
          return `${acc}#${item}`;
      }
    }, "");
  };
  var getUserAgentMiddlewareOptions = {
    name: "getUserAgentMiddleware",
    step: "build",
    priority: "low",
    tags: ["SET_USER_AGENT", "USER_AGENT"],
    override: true
  };
  var getUserAgentPlugin = (config2) => ({
    applyToStack: (clientStack) => {
      clientStack.add(userAgentMiddleware(config2), getUserAgentMiddlewareOptions);
    }
  });

  // node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseDualstackEndpointConfigOptions.js
  var DEFAULT_USE_DUALSTACK_ENDPOINT = false;

  // node_modules/@smithy/config-resolver/dist-es/endpointsConfig/NodeUseFipsEndpointConfigOptions.js
  var DEFAULT_USE_FIPS_ENDPOINT = false;

  // node_modules/@smithy/config-resolver/dist-es/regionConfig/isFipsRegion.js
  var isFipsRegion = (region) => typeof region === "string" && (region.startsWith("fips-") || region.endsWith("-fips"));

  // node_modules/@smithy/config-resolver/dist-es/regionConfig/getRealRegion.js
  var getRealRegion = (region) => isFipsRegion(region) ? ["fips-aws-global", "aws-fips"].includes(region) ? "us-east-1" : region.replace(/fips-(dkr-|prod-)?|-fips/, "") : region;

  // node_modules/@smithy/config-resolver/dist-es/regionConfig/resolveRegionConfig.js
  var resolveRegionConfig = (input) => {
    const { region, useFipsEndpoint } = input;
    if (!region) {
      throw new Error("Region is missing");
    }
    return {
      ...input,
      region: async () => {
        if (typeof region === "string") {
          return getRealRegion(region);
        }
        const providedRegion = await region();
        return getRealRegion(providedRegion);
      },
      useFipsEndpoint: async () => {
        const providedRegion = typeof region === "string" ? region : await region();
        if (isFipsRegion(providedRegion)) {
          return true;
        }
        return typeof useFipsEndpoint !== "function" ? Promise.resolve(!!useFipsEndpoint) : useFipsEndpoint();
      }
    };
  };

  // node_modules/@smithy/eventstream-serde-config-resolver/dist-es/EventStreamSerdeConfig.js
  var resolveEventStreamSerdeConfig = (input) => ({
    ...input,
    eventStreamMarshaller: input.eventStreamSerdeProvider(input)
  });

  // node_modules/@smithy/middleware-content-length/dist-es/index.js
  var CONTENT_LENGTH_HEADER2 = "content-length";
  function contentLengthMiddleware(bodyLengthChecker) {
    return (next) => async (args) => {
      const request = args.request;
      if (HttpRequest.isInstance(request)) {
        const { body, headers } = request;
        if (body && Object.keys(headers).map((str2) => str2.toLowerCase()).indexOf(CONTENT_LENGTH_HEADER2) === -1) {
          try {
            const length = bodyLengthChecker(body);
            request.headers = {
              ...request.headers,
              [CONTENT_LENGTH_HEADER2]: String(length)
            };
          } catch (error) {
          }
        }
      }
      return next({
        ...args,
        request
      });
    };
  }
  var contentLengthMiddlewareOptions = {
    step: "build",
    tags: ["SET_CONTENT_LENGTH", "CONTENT_LENGTH"],
    name: "contentLengthMiddleware",
    override: true
  };
  var getContentLengthPlugin = (options) => ({
    applyToStack: (clientStack) => {
      clientStack.add(contentLengthMiddleware(options.bodyLengthChecker), contentLengthMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getDateHeader.js
  var getDateHeader = (response) => HttpResponse.isInstance(response) ? response.headers?.date ?? response.headers?.Date : void 0;

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getSkewCorrectedDate.js
  var getSkewCorrectedDate = (systemClockOffset) => new Date(Date.now() + systemClockOffset);

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/isClockSkewed.js
  var isClockSkewed = (clockTime, systemClockOffset) => Math.abs(getSkewCorrectedDate(systemClockOffset).getTime() - clockTime) >= 3e5;

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/utils/getUpdatedSystemClockOffset.js
  var getUpdatedSystemClockOffset = (clockTime, currentSystemClockOffset) => {
    const clockTimeInMs = Date.parse(clockTime);
    if (isClockSkewed(clockTimeInMs, currentSystemClockOffset)) {
      return clockTimeInMs - Date.now();
    }
    return currentSystemClockOffset;
  };

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4Signer.js
  var throwSigningPropertyError = (name, property) => {
    if (!property) {
      throw new Error(`Property \`${name}\` is not resolved for AWS SDK SigV4Auth`);
    }
    return property;
  };
  var validateSigningProperties = async (signingProperties) => {
    const context = throwSigningPropertyError("context", signingProperties.context);
    const config2 = throwSigningPropertyError("config", signingProperties.config);
    const authScheme = context.endpointV2?.properties?.authSchemes?.[0];
    const signerFunction = throwSigningPropertyError("signer", config2.signer);
    const signer = await signerFunction(authScheme);
    const signingRegion = signingProperties?.signingRegion;
    const signingRegionSet = signingProperties?.signingRegionSet;
    const signingName = signingProperties?.signingName;
    return {
      config: config2,
      signer,
      signingRegion,
      signingRegionSet,
      signingName
    };
  };
  var AwsSdkSigV4Signer = class {
    async sign(httpRequest, identity, signingProperties) {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const validatedProps = await validateSigningProperties(signingProperties);
      const { config: config2, signer } = validatedProps;
      let { signingRegion, signingName } = validatedProps;
      const handlerExecutionContext = signingProperties.context;
      if (handlerExecutionContext?.authSchemes?.length ?? 0 > 1) {
        const [first, second] = handlerExecutionContext.authSchemes;
        if (first?.name === "sigv4a" && second?.name === "sigv4") {
          signingRegion = second?.signingRegion ?? signingRegion;
          signingName = second?.signingName ?? signingName;
        }
      }
      const signedRequest = await signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config2.systemClockOffset),
        signingRegion,
        signingService: signingName
      });
      return signedRequest;
    }
    errorHandler(signingProperties) {
      return (error) => {
        const serverTime = error.ServerTime ?? getDateHeader(error.$response);
        if (serverTime) {
          const config2 = throwSigningPropertyError("config", signingProperties.config);
          const initialSystemClockOffset = config2.systemClockOffset;
          config2.systemClockOffset = getUpdatedSystemClockOffset(serverTime, config2.systemClockOffset);
          const clockSkewCorrected = config2.systemClockOffset !== initialSystemClockOffset;
          if (clockSkewCorrected && error.$metadata) {
            error.$metadata.clockSkewCorrected = true;
          }
        }
        throw error;
      };
    }
    successHandler(httpResponse, signingProperties) {
      const dateHeader = getDateHeader(httpResponse);
      if (dateHeader) {
        const config2 = throwSigningPropertyError("config", signingProperties.config);
        config2.systemClockOffset = getUpdatedSystemClockOffset(dateHeader, config2.systemClockOffset);
      }
    }
  };

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/AwsSdkSigV4ASigner.js
  var AwsSdkSigV4ASigner = class extends AwsSdkSigV4Signer {
    async sign(httpRequest, identity, signingProperties) {
      if (!HttpRequest.isInstance(httpRequest)) {
        throw new Error("The request is not an instance of `HttpRequest` and cannot be signed");
      }
      const { config: config2, signer, signingRegion, signingRegionSet, signingName } = await validateSigningProperties(signingProperties);
      const multiRegionOverride = signingRegionSet?.join?.(",") ?? signingRegion;
      const signedRequest = await signer.sign(httpRequest, {
        signingDate: getSkewCorrectedDate(config2.systemClockOffset),
        signingRegion: multiRegionOverride,
        signingService: signingName
      });
      return signedRequest;
    }
  };

  // node_modules/@aws-sdk/core/dist-es/submodules/httpAuthSchemes/aws_sdk/resolveAwsSdkSigV4Config.js
  var resolveAwsSdkSigV4Config = (config2) => {
    let normalizedCreds;
    if (config2.credentials) {
      normalizedCreds = memoizeIdentityProvider(config2.credentials, isIdentityExpired, doesIdentityRequireRefresh);
    }
    if (!normalizedCreds) {
      if (config2.credentialDefaultProvider) {
        normalizedCreds = normalizeProvider2(config2.credentialDefaultProvider(Object.assign({}, config2, {
          parentClientConfig: config2
        })));
      } else {
        normalizedCreds = async () => {
          throw new Error("`credentials` is missing");
        };
      }
    }
    const { signingEscapePath = true, systemClockOffset = config2.systemClockOffset || 0, sha256 } = config2;
    let signer;
    if (config2.signer) {
      signer = normalizeProvider2(config2.signer);
    } else if (config2.regionInfoProvider) {
      signer = () => normalizeProvider2(config2.region)().then(async (region) => [
        await config2.regionInfoProvider(region, {
          useFipsEndpoint: await config2.useFipsEndpoint(),
          useDualstackEndpoint: await config2.useDualstackEndpoint()
        }) || {},
        region
      ]).then(([regionInfo, region]) => {
        const { signingRegion, signingService } = regionInfo;
        config2.signingRegion = config2.signingRegion || signingRegion || region;
        config2.signingName = config2.signingName || signingService || config2.serviceId;
        const params = {
          ...config2,
          credentials: normalizedCreds,
          region: config2.signingRegion,
          service: config2.signingName,
          sha256,
          uriEscapePath: signingEscapePath
        };
        const SignerCtor = config2.signerConstructor || SignatureV4;
        return new SignerCtor(params);
      });
    } else {
      signer = async (authScheme) => {
        authScheme = Object.assign({}, {
          name: "sigv4",
          signingName: config2.signingName || config2.defaultSigningName,
          signingRegion: await normalizeProvider2(config2.region)(),
          properties: {}
        }, authScheme);
        const signingRegion = authScheme.signingRegion;
        const signingService = authScheme.signingName;
        config2.signingRegion = config2.signingRegion || signingRegion;
        config2.signingName = config2.signingName || signingService || config2.serviceId;
        const params = {
          ...config2,
          credentials: normalizedCreds,
          region: config2.signingRegion,
          service: config2.signingName,
          sha256,
          uriEscapePath: signingEscapePath
        };
        const SignerCtor = config2.signerConstructor || SignatureV4;
        return new SignerCtor(params);
      };
    }
    return {
      ...config2,
      systemClockOffset,
      signingEscapePath,
      credentials: normalizedCreds,
      signer
    };
  };

  // node_modules/@aws-sdk/core/dist-es/submodules/protocols/common.js
  var collectBodyString = (streamBody, context) => collectBody(streamBody, context).then((body) => context.utf8Encoder(body));

  // node_modules/@aws-sdk/core/dist-es/submodules/protocols/xml/parseXmlBody.js
  var import_fast_xml_parser = __toESM(require_fxp());
  var parseXmlBody = (streamBody, context) => collectBodyString(streamBody, context).then((encoded) => {
    if (encoded.length) {
      const parser = new import_fast_xml_parser.XMLParser({
        attributeNamePrefix: "",
        htmlEntities: true,
        ignoreAttributes: false,
        ignoreDeclaration: true,
        parseTagValue: false,
        trimValues: false,
        tagValueProcessor: (_, val2) => val2.trim() === "" && val2.includes("\n") ? "" : void 0
      });
      parser.addEntity("#xD", "\r");
      parser.addEntity("#10", "\n");
      let parsedObj;
      try {
        parsedObj = parser.parse(encoded, true);
      } catch (e2) {
        if (e2 && typeof e2 === "object") {
          Object.defineProperty(e2, "$responseBodyText", {
            value: encoded
          });
        }
        throw e2;
      }
      const textNodeName = "#text";
      const key = Object.keys(parsedObj)[0];
      const parsedObjToReturn = parsedObj[key];
      if (parsedObjToReturn[textNodeName]) {
        parsedObjToReturn[key] = parsedObjToReturn[textNodeName];
        delete parsedObjToReturn[textNodeName];
      }
      return getValueFromTextNode(parsedObjToReturn);
    }
    return {};
  });
  var parseXmlErrorBody = async (errorBody, context) => {
    const value = await parseXmlBody(errorBody, context);
    if (value.Error) {
      value.Error.message = value.Error.message ?? value.Error.Message;
    }
    return value;
  };
  var loadRestXmlErrorCode = (output, data) => {
    if (data?.Error?.Code !== void 0) {
      return data.Error.Code;
    }
    if (data?.Code !== void 0) {
      return data.Code;
    }
    if (output.statusCode == 404) {
      return "NotFound";
    }
  };

  // node_modules/@aws-sdk/signature-v4-multi-region/dist-es/signature-v4-crt-container.js
  var signatureV4CrtContainer = {
    CrtSignerV4: null
  };

  // node_modules/@aws-sdk/signature-v4-multi-region/dist-es/SignatureV4MultiRegion.js
  var SignatureV4MultiRegion = class {
    constructor(options) {
      this.sigv4Signer = new SignatureV4S3Express(options);
      this.signerOptions = options;
    }
    async sign(requestToSign, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node")
          throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().sign(requestToSign, options);
      }
      return this.sigv4Signer.sign(requestToSign, options);
    }
    async signWithCredentials(requestToSign, credentials, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node")
          throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().signWithCredentials(requestToSign, credentials, options);
      }
      return this.sigv4Signer.signWithCredentials(requestToSign, credentials, options);
    }
    async presign(originalRequest, options = {}) {
      if (options.signingRegion === "*") {
        if (this.signerOptions.runtime !== "node")
          throw new Error("This request requires signing with SigV4Asymmetric algorithm. It's only available in Node.js");
        return this.getSigv4aSigner().presign(originalRequest, options);
      }
      return this.sigv4Signer.presign(originalRequest, options);
    }
    async presignWithCredentials(originalRequest, credentials, options = {}) {
      if (options.signingRegion === "*") {
        throw new Error("Method presignWithCredentials is not supported for [signingRegion=*].");
      }
      return this.sigv4Signer.presignWithCredentials(originalRequest, credentials, options);
    }
    getSigv4aSigner() {
      if (!this.sigv4aSigner) {
        let CrtSignerV4 = null;
        try {
          CrtSignerV4 = signatureV4CrtContainer.CrtSignerV4;
          if (typeof CrtSignerV4 !== "function")
            throw new Error();
        } catch (e2) {
          e2.message = `${e2.message}
Please check whether you have installed the "@aws-sdk/signature-v4-crt" package explicitly. 
You must also register the package by calling [require("@aws-sdk/signature-v4-crt");] or an ESM equivalent such as [import "@aws-sdk/signature-v4-crt";]. 
For more information please go to https://github.com/aws/aws-sdk-js-v3#functionality-requiring-aws-common-runtime-crt`;
          throw e2;
        }
        this.sigv4aSigner = new CrtSignerV4({
          ...this.signerOptions,
          signingAlgorithm: 1
        });
      }
      return this.sigv4aSigner;
    }
  };

  // node_modules/@aws-sdk/client-s3/dist-es/endpoint/ruleset.js
  var ce = "required";
  var cf = "type";
  var cg = "conditions";
  var ch = "fn";
  var ci = "argv";
  var cj = "ref";
  var ck = "assign";
  var cl = "url";
  var cm = "properties";
  var cn = "backend";
  var co = "authSchemes";
  var cp = "disableDoubleEncoding";
  var cq = "signingName";
  var cr = "signingRegion";
  var cs = "headers";
  var ct = "signingRegionSet";
  var a = false;
  var b = true;
  var c = "isSet";
  var d2 = "booleanEquals";
  var e = "error";
  var f = "aws.partition";
  var g = "stringEquals";
  var h2 = "getAttr";
  var i = "name";
  var j = "substring";
  var k = "bucketSuffix";
  var l = "parseURL";
  var m2 = "{url#scheme}://{url#authority}/{uri_encoded_bucket}{url#path}";
  var n = "endpoint";
  var o = "tree";
  var p = "aws.isVirtualHostableS3Bucket";
  var q = "{url#scheme}://{Bucket}.{url#authority}{url#path}";
  var r = "not";
  var s2 = "{url#scheme}://{url#authority}{url#path}";
  var t = "hardwareType";
  var u = "regionPrefix";
  var v = "bucketAliasSuffix";
  var w2 = "outpostId";
  var x = "isValidHostLabel";
  var y2 = "sigv4a";
  var z = "s3-outposts";
  var A = "s3";
  var B = "{url#scheme}://{url#authority}{url#normalizedPath}{Bucket}";
  var C = "https://{Bucket}.s3-accelerate.{partitionResult#dnsSuffix}";
  var D = "https://{Bucket}.s3.{partitionResult#dnsSuffix}";
  var E = "aws.parseArn";
  var F = "bucketArn";
  var G = "arnType";
  var H = "";
  var I = "s3-object-lambda";
  var J = "accesspoint";
  var K = "accessPointName";
  var L = "{url#scheme}://{accessPointName}-{bucketArn#accountId}.{url#authority}{url#path}";
  var M = "mrapPartition";
  var N = "outpostType";
  var O = "arnPrefix";
  var P = "{url#scheme}://{url#authority}{url#normalizedPath}{uri_encoded_bucket}";
  var Q = "https://s3.{partitionResult#dnsSuffix}/{uri_encoded_bucket}";
  var R = "https://s3.{partitionResult#dnsSuffix}";
  var S = { [ce]: false, [cf]: "String" };
  var T = { [ce]: true, "default": false, [cf]: "Boolean" };
  var U = { [ce]: false, [cf]: "Boolean" };
  var V = { [ch]: d2, [ci]: [{ [cj]: "Accelerate" }, true] };
  var W = { [ch]: d2, [ci]: [{ [cj]: "UseFIPS" }, true] };
  var X = { [ch]: d2, [ci]: [{ [cj]: "UseDualStack" }, true] };
  var Y = { [ch]: c, [ci]: [{ [cj]: "Endpoint" }] };
  var Z = { [ch]: f, [ci]: [{ [cj]: "Region" }], [ck]: "partitionResult" };
  var aa = { [ch]: g, [ci]: [{ [ch]: h2, [ci]: [{ [cj]: "partitionResult" }, i] }, "aws-cn"] };
  var ab = { [ch]: c, [ci]: [{ [cj]: "Bucket" }] };
  var ac = { [cj]: "Bucket" };
  var ad = { [ch]: l, [ci]: [{ [cj]: "Endpoint" }], [ck]: "url" };
  var ae = { [ch]: d2, [ci]: [{ [ch]: h2, [ci]: [{ [cj]: "url" }, "isIp"] }, true] };
  var af = { [cj]: "url" };
  var ag = { [ch]: "uriEncode", [ci]: [ac], [ck]: "uri_encoded_bucket" };
  var ah = { [cn]: "S3Express", [co]: [{ [cp]: true, [i]: "sigv4", [cq]: "s3express", [cr]: "{Region}" }] };
  var ai = {};
  var aj = { [ch]: p, [ci]: [ac, false] };
  var ak = { [e]: "S3Express bucket name is not a valid virtual hostable name.", [cf]: e };
  var al = { [cn]: "S3Express", [co]: [{ [cp]: true, [i]: "sigv4-s3express", [cq]: "s3express", [cr]: "{Region}" }] };
  var am = { [ch]: c, [ci]: [{ [cj]: "UseS3ExpressControlEndpoint" }] };
  var an = { [ch]: d2, [ci]: [{ [cj]: "UseS3ExpressControlEndpoint" }, true] };
  var ao = { [ch]: r, [ci]: [Y] };
  var ap = { [e]: "Unrecognized S3Express bucket name format.", [cf]: e };
  var aq = { [ch]: r, [ci]: [ab] };
  var ar = { [cj]: t };
  var as = { [cg]: [ao], [e]: "Expected a endpoint to be specified but no endpoint was found", [cf]: e };
  var at = { [co]: [{ [cp]: true, [i]: y2, [cq]: z, [ct]: ["*"] }, { [cp]: true, [i]: "sigv4", [cq]: z, [cr]: "{Region}" }] };
  var au = { [ch]: d2, [ci]: [{ [cj]: "ForcePathStyle" }, false] };
  var av = { [cj]: "ForcePathStyle" };
  var aw = { [ch]: d2, [ci]: [{ [cj]: "Accelerate" }, false] };
  var ax = { [ch]: g, [ci]: [{ [cj]: "Region" }, "aws-global"] };
  var ay = { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: A, [cr]: "us-east-1" }] };
  var az = { [ch]: r, [ci]: [ax] };
  var aA = { [ch]: d2, [ci]: [{ [cj]: "UseGlobalEndpoint" }, true] };
  var aB = { [cl]: "https://{Bucket}.s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", [cm]: { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: A, [cr]: "{Region}" }] }, [cs]: {} };
  var aC = { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: A, [cr]: "{Region}" }] };
  var aD = { [ch]: d2, [ci]: [{ [cj]: "UseGlobalEndpoint" }, false] };
  var aE = { [ch]: d2, [ci]: [{ [cj]: "UseDualStack" }, false] };
  var aF = { [cl]: "https://{Bucket}.s3-fips.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var aG = { [ch]: d2, [ci]: [{ [cj]: "UseFIPS" }, false] };
  var aH = { [cl]: "https://{Bucket}.s3-accelerate.dualstack.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var aI = { [cl]: "https://{Bucket}.s3.dualstack.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var aJ = { [ch]: d2, [ci]: [{ [ch]: h2, [ci]: [af, "isIp"] }, false] };
  var aK = { [cl]: B, [cm]: aC, [cs]: {} };
  var aL = { [cl]: q, [cm]: aC, [cs]: {} };
  var aM = { [n]: aL, [cf]: n };
  var aN = { [cl]: C, [cm]: aC, [cs]: {} };
  var aO = { [cl]: "https://{Bucket}.s3.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var aP = { [e]: "Invalid region: region was not a valid DNS name.", [cf]: e };
  var aQ = { [cj]: F };
  var aR = { [cj]: G };
  var aS = { [ch]: h2, [ci]: [aQ, "service"] };
  var aT = { [cj]: K };
  var aU = { [cg]: [X], [e]: "S3 Object Lambda does not support Dual-stack", [cf]: e };
  var aV = { [cg]: [V], [e]: "S3 Object Lambda does not support S3 Accelerate", [cf]: e };
  var aW = { [cg]: [{ [ch]: c, [ci]: [{ [cj]: "DisableAccessPoints" }] }, { [ch]: d2, [ci]: [{ [cj]: "DisableAccessPoints" }, true] }], [e]: "Access points are not supported for this operation", [cf]: e };
  var aX = { [cg]: [{ [ch]: c, [ci]: [{ [cj]: "UseArnRegion" }] }, { [ch]: d2, [ci]: [{ [cj]: "UseArnRegion" }, false] }, { [ch]: r, [ci]: [{ [ch]: g, [ci]: [{ [ch]: h2, [ci]: [aQ, "region"] }, "{Region}"] }] }], [e]: "Invalid configuration: region from ARN `{bucketArn#region}` does not match client region `{Region}` and UseArnRegion is `false`", [cf]: e };
  var aY = { [ch]: h2, [ci]: [{ [cj]: "bucketPartition" }, i] };
  var aZ = { [ch]: h2, [ci]: [aQ, "accountId"] };
  var ba = { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: I, [cr]: "{bucketArn#region}" }] };
  var bb = { [e]: "Invalid ARN: The access point name may only contain a-z, A-Z, 0-9 and `-`. Found: `{accessPointName}`", [cf]: e };
  var bc = { [e]: "Invalid ARN: The account id may only contain a-z, A-Z, 0-9 and `-`. Found: `{bucketArn#accountId}`", [cf]: e };
  var bd = { [e]: "Invalid region in ARN: `{bucketArn#region}` (invalid DNS name)", [cf]: e };
  var be = { [e]: "Client was configured for partition `{partitionResult#name}` but ARN (`{Bucket}`) has `{bucketPartition#name}`", [cf]: e };
  var bf = { [e]: "Invalid ARN: The ARN may only contain a single resource component after `accesspoint`.", [cf]: e };
  var bg = { [e]: "Invalid ARN: Expected a resource of the format `accesspoint:<accesspoint name>` but no name was provided", [cf]: e };
  var bh = { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: A, [cr]: "{bucketArn#region}" }] };
  var bi = { [co]: [{ [cp]: true, [i]: y2, [cq]: z, [ct]: ["*"] }, { [cp]: true, [i]: "sigv4", [cq]: z, [cr]: "{bucketArn#region}" }] };
  var bj = { [ch]: E, [ci]: [ac] };
  var bk = { [cl]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: aC, [cs]: {} };
  var bl = { [cl]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: aC, [cs]: {} };
  var bm = { [cl]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: aC, [cs]: {} };
  var bn = { [cl]: P, [cm]: aC, [cs]: {} };
  var bo = { [cl]: "https://s3.{Region}.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: aC, [cs]: {} };
  var bp = { [cj]: "UseObjectLambdaEndpoint" };
  var bq = { [co]: [{ [cp]: true, [i]: "sigv4", [cq]: I, [cr]: "{Region}" }] };
  var br = { [cl]: "https://s3-fips.dualstack.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var bs = { [cl]: "https://s3-fips.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var bt = { [cl]: "https://s3.dualstack.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var bu = { [cl]: s2, [cm]: aC, [cs]: {} };
  var bv = { [cl]: "https://s3.{Region}.{partitionResult#dnsSuffix}", [cm]: aC, [cs]: {} };
  var bw = [{ [cj]: "Region" }];
  var bx = [{ [cj]: "Endpoint" }];
  var by = [ac];
  var bz = [X];
  var bA = [V];
  var bB = [Y, ad];
  var bC = [{ [ch]: c, [ci]: [{ [cj]: "DisableS3ExpressSessionAuth" }] }, { [ch]: d2, [ci]: [{ [cj]: "DisableS3ExpressSessionAuth" }, true] }];
  var bD = [ae];
  var bE = [ag];
  var bF = [aj];
  var bG = [W];
  var bH = [{ [ch]: j, [ci]: [ac, 6, 14, true], [ck]: "s3expressAvailabilityZoneId" }, { [ch]: j, [ci]: [ac, 14, 16, true], [ck]: "s3expressAvailabilityZoneDelim" }, { [ch]: g, [ci]: [{ [cj]: "s3expressAvailabilityZoneDelim" }, "--"] }];
  var bI = [{ [cg]: [W], [n]: { [cl]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com", [cm]: ah, [cs]: {} }, [cf]: n }, { [n]: { [cl]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com", [cm]: ah, [cs]: {} }, [cf]: n }];
  var bJ = [{ [ch]: j, [ci]: [ac, 6, 15, true], [ck]: "s3expressAvailabilityZoneId" }, { [ch]: j, [ci]: [ac, 15, 17, true], [ck]: "s3expressAvailabilityZoneDelim" }, { [ch]: g, [ci]: [{ [cj]: "s3expressAvailabilityZoneDelim" }, "--"] }];
  var bK = [{ [cg]: [W], [n]: { [cl]: "https://{Bucket}.s3express-fips-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com", [cm]: al, [cs]: {} }, [cf]: n }, { [n]: { [cl]: "https://{Bucket}.s3express-{s3expressAvailabilityZoneId}.{Region}.amazonaws.com", [cm]: al, [cs]: {} }, [cf]: n }];
  var bL = [ab];
  var bM = [{ [ch]: x, [ci]: [{ [cj]: w2 }, false] }];
  var bN = [{ [ch]: g, [ci]: [{ [cj]: u }, "beta"] }];
  var bO = ["*"];
  var bP = [Z];
  var bQ = [{ [ch]: x, [ci]: [{ [cj]: "Region" }, false] }];
  var bR = [{ [ch]: g, [ci]: [{ [cj]: "Region" }, "us-east-1"] }];
  var bS = [{ [ch]: g, [ci]: [aR, J] }];
  var bT = [{ [ch]: h2, [ci]: [aQ, "resourceId[1]"], [ck]: K }, { [ch]: r, [ci]: [{ [ch]: g, [ci]: [aT, H] }] }];
  var bU = [aQ, "resourceId[1]"];
  var bV = [{ [ch]: r, [ci]: [{ [ch]: g, [ci]: [{ [ch]: h2, [ci]: [aQ, "region"] }, H] }] }];
  var bW = [{ [ch]: r, [ci]: [{ [ch]: c, [ci]: [{ [ch]: h2, [ci]: [aQ, "resourceId[2]"] }] }] }];
  var bX = [aQ, "resourceId[2]"];
  var bY = [{ [ch]: f, [ci]: [{ [ch]: h2, [ci]: [aQ, "region"] }], [ck]: "bucketPartition" }];
  var bZ = [{ [ch]: g, [ci]: [aY, { [ch]: h2, [ci]: [{ [cj]: "partitionResult" }, i] }] }];
  var ca = [{ [ch]: x, [ci]: [{ [ch]: h2, [ci]: [aQ, "region"] }, true] }];
  var cb = [{ [ch]: x, [ci]: [aZ, false] }];
  var cc = [{ [ch]: x, [ci]: [aT, false] }];
  var cd = [{ [ch]: x, [ci]: [{ [cj]: "Region" }, true] }];
  var _data = { version: "1.0", parameters: { Bucket: S, Region: S, UseFIPS: T, UseDualStack: T, Endpoint: S, ForcePathStyle: T, Accelerate: T, UseGlobalEndpoint: T, UseObjectLambdaEndpoint: U, Key: S, Prefix: S, CopySource: S, DisableAccessPoints: U, DisableMultiRegionAccessPoints: T, UseArnRegion: U, UseS3ExpressControlEndpoint: U, DisableS3ExpressSessionAuth: U }, rules: [{ [cg]: [{ [ch]: c, [ci]: bw }], rules: [{ [cg]: [V, W], error: "Accelerate cannot be used with FIPS", [cf]: e }, { [cg]: [X, Y], error: "Cannot set dual-stack in combination with a custom endpoint.", [cf]: e }, { [cg]: [Y, W], error: "A custom endpoint cannot be combined with FIPS", [cf]: e }, { [cg]: [Y, V], error: "A custom endpoint cannot be combined with S3 Accelerate", [cf]: e }, { [cg]: [W, Z, aa], error: "Partition does not support FIPS", [cf]: e }, { [cg]: [ab, { [ch]: j, [ci]: [ac, 0, 6, b], [ck]: k }, { [ch]: g, [ci]: [{ [cj]: k }, "--x-s3"] }], rules: [{ [cg]: bz, error: "S3Express does not support Dual-stack.", [cf]: e }, { [cg]: bA, error: "S3Express does not support S3 Accelerate.", [cf]: e }, { [cg]: bB, rules: [{ [cg]: bC, rules: [{ [cg]: bD, rules: [{ [cg]: bE, rules: [{ endpoint: { [cl]: m2, [cm]: ah, [cs]: ai }, [cf]: n }], [cf]: o }], [cf]: o }, { [cg]: bF, rules: [{ endpoint: { [cl]: q, [cm]: ah, [cs]: ai }, [cf]: n }], [cf]: o }, ak], [cf]: o }, { [cg]: bD, rules: [{ [cg]: bE, rules: [{ endpoint: { [cl]: m2, [cm]: al, [cs]: ai }, [cf]: n }], [cf]: o }], [cf]: o }, { [cg]: bF, rules: [{ endpoint: { [cl]: q, [cm]: al, [cs]: ai }, [cf]: n }], [cf]: o }, ak], [cf]: o }, { [cg]: [am, an], rules: [{ [cg]: [ag, ao], rules: [{ [cg]: bG, endpoint: { [cl]: "https://s3express-control-fips.{Region}.amazonaws.com/{uri_encoded_bucket}", [cm]: ah, [cs]: ai }, [cf]: n }, { endpoint: { [cl]: "https://s3express-control.{Region}.amazonaws.com/{uri_encoded_bucket}", [cm]: ah, [cs]: ai }, [cf]: n }], [cf]: o }], [cf]: o }, { [cg]: bF, rules: [{ [cg]: bC, rules: [{ [cg]: bH, rules: bI, [cf]: o }, { [cg]: bJ, rules: bI, [cf]: o }, ap], [cf]: o }, { [cg]: bH, rules: bK, [cf]: o }, { [cg]: bJ, rules: bK, [cf]: o }, ap], [cf]: o }, ak], [cf]: o }, { [cg]: [aq, am, an], rules: [{ [cg]: bB, endpoint: { [cl]: s2, [cm]: ah, [cs]: ai }, [cf]: n }, { [cg]: bG, endpoint: { [cl]: "https://s3express-control-fips.{Region}.amazonaws.com", [cm]: ah, [cs]: ai }, [cf]: n }, { endpoint: { [cl]: "https://s3express-control.{Region}.amazonaws.com", [cm]: ah, [cs]: ai }, [cf]: n }], [cf]: o }, { [cg]: [ab, { [ch]: j, [ci]: [ac, 49, 50, b], [ck]: t }, { [ch]: j, [ci]: [ac, 8, 12, b], [ck]: u }, { [ch]: j, [ci]: [ac, 0, 7, b], [ck]: v }, { [ch]: j, [ci]: [ac, 32, 49, b], [ck]: w2 }, { [ch]: f, [ci]: bw, [ck]: "regionPartition" }, { [ch]: g, [ci]: [{ [cj]: v }, "--op-s3"] }], rules: [{ [cg]: bM, rules: [{ [cg]: [{ [ch]: g, [ci]: [ar, "e"] }], rules: [{ [cg]: bN, rules: [as, { [cg]: bB, endpoint: { [cl]: "https://{Bucket}.ec2.{url#authority}", [cm]: at, [cs]: ai }, [cf]: n }], [cf]: o }, { endpoint: { [cl]: "https://{Bucket}.ec2.s3-outposts.{Region}.{regionPartition#dnsSuffix}", [cm]: at, [cs]: ai }, [cf]: n }], [cf]: o }, { [cg]: [{ [ch]: g, [ci]: [ar, "o"] }], rules: [{ [cg]: bN, rules: [as, { [cg]: bB, endpoint: { [cl]: "https://{Bucket}.op-{outpostId}.{url#authority}", [cm]: at, [cs]: ai }, [cf]: n }], [cf]: o }, { endpoint: { [cl]: "https://{Bucket}.op-{outpostId}.s3-outposts.{Region}.{regionPartition#dnsSuffix}", [cm]: at, [cs]: ai }, [cf]: n }], [cf]: o }, { error: 'Unrecognized hardware type: "Expected hardware type o or e but got {hardwareType}"', [cf]: e }], [cf]: o }, { error: "Invalid ARN: The outpost Id must only contain a-z, A-Z, 0-9 and `-`.", [cf]: e }], [cf]: o }, { [cg]: bL, rules: [{ [cg]: [Y, { [ch]: r, [ci]: [{ [ch]: c, [ci]: [{ [ch]: l, [ci]: bx }] }] }], error: "Custom endpoint `{Endpoint}` was not a valid URI", [cf]: e }, { [cg]: [au, aj], rules: [{ [cg]: bP, rules: [{ [cg]: bQ, rules: [{ [cg]: [V, aa], error: "S3 Accelerate cannot be used in this region", [cf]: e }, { [cg]: [X, W, aw, ao, ax], endpoint: { [cl]: "https://{Bucket}.s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [X, W, aw, ao, az, aA], rules: [{ endpoint: aB, [cf]: n }], [cf]: o }, { [cg]: [X, W, aw, ao, az, aD], endpoint: aB, [cf]: n }, { [cg]: [aE, W, aw, ao, ax], endpoint: { [cl]: "https://{Bucket}.s3-fips.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, W, aw, ao, az, aA], rules: [{ endpoint: aF, [cf]: n }], [cf]: o }, { [cg]: [aE, W, aw, ao, az, aD], endpoint: aF, [cf]: n }, { [cg]: [X, aG, V, ao, ax], endpoint: { [cl]: "https://{Bucket}.s3-accelerate.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [X, aG, V, ao, az, aA], rules: [{ endpoint: aH, [cf]: n }], [cf]: o }, { [cg]: [X, aG, V, ao, az, aD], endpoint: aH, [cf]: n }, { [cg]: [X, aG, aw, ao, ax], endpoint: { [cl]: "https://{Bucket}.s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [X, aG, aw, ao, az, aA], rules: [{ endpoint: aI, [cf]: n }], [cf]: o }, { [cg]: [X, aG, aw, ao, az, aD], endpoint: aI, [cf]: n }, { [cg]: [aE, aG, aw, Y, ad, ae, ax], endpoint: { [cl]: B, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, aG, aw, Y, ad, aJ, ax], endpoint: { [cl]: q, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, aG, aw, Y, ad, ae, az, aA], rules: [{ [cg]: bR, endpoint: aK, [cf]: n }, { endpoint: aK, [cf]: n }], [cf]: o }, { [cg]: [aE, aG, aw, Y, ad, aJ, az, aA], rules: [{ [cg]: bR, endpoint: aL, [cf]: n }, aM], [cf]: o }, { [cg]: [aE, aG, aw, Y, ad, ae, az, aD], endpoint: aK, [cf]: n }, { [cg]: [aE, aG, aw, Y, ad, aJ, az, aD], endpoint: aL, [cf]: n }, { [cg]: [aE, aG, V, ao, ax], endpoint: { [cl]: C, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, aG, V, ao, az, aA], rules: [{ [cg]: bR, endpoint: aN, [cf]: n }, { endpoint: aN, [cf]: n }], [cf]: o }, { [cg]: [aE, aG, V, ao, az, aD], endpoint: aN, [cf]: n }, { [cg]: [aE, aG, aw, ao, ax], endpoint: { [cl]: D, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, aG, aw, ao, az, aA], rules: [{ [cg]: bR, endpoint: { [cl]: D, [cm]: aC, [cs]: ai }, [cf]: n }, { endpoint: aO, [cf]: n }], [cf]: o }, { [cg]: [aE, aG, aw, ao, az, aD], endpoint: aO, [cf]: n }], [cf]: o }, aP], [cf]: o }], [cf]: o }, { [cg]: [Y, ad, { [ch]: g, [ci]: [{ [ch]: h2, [ci]: [af, "scheme"] }, "http"] }, { [ch]: p, [ci]: [ac, b] }, au, aG, aE, aw], rules: [{ [cg]: bP, rules: [{ [cg]: bQ, rules: [aM], [cf]: o }, aP], [cf]: o }], [cf]: o }, { [cg]: [au, { [ch]: E, [ci]: by, [ck]: F }], rules: [{ [cg]: [{ [ch]: h2, [ci]: [aQ, "resourceId[0]"], [ck]: G }, { [ch]: r, [ci]: [{ [ch]: g, [ci]: [aR, H] }] }], rules: [{ [cg]: [{ [ch]: g, [ci]: [aS, I] }], rules: [{ [cg]: bS, rules: [{ [cg]: bT, rules: [aU, aV, { [cg]: bV, rules: [aW, { [cg]: bW, rules: [aX, { [cg]: bY, rules: [{ [cg]: bP, rules: [{ [cg]: bZ, rules: [{ [cg]: ca, rules: [{ [cg]: [{ [ch]: g, [ci]: [aZ, H] }], error: "Invalid ARN: Missing account id", [cf]: e }, { [cg]: cb, rules: [{ [cg]: cc, rules: [{ [cg]: bB, endpoint: { [cl]: L, [cm]: ba, [cs]: ai }, [cf]: n }, { [cg]: bG, endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: ba, [cs]: ai }, [cf]: n }, { endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-object-lambda.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: ba, [cs]: ai }, [cf]: n }], [cf]: o }, bb], [cf]: o }, bc], [cf]: o }, bd], [cf]: o }, be], [cf]: o }], [cf]: o }], [cf]: o }, bf], [cf]: o }, { error: "Invalid ARN: bucket ARN is missing a region", [cf]: e }], [cf]: o }, bg], [cf]: o }, { error: "Invalid ARN: Object Lambda ARNs only support `accesspoint` arn types, but found: `{arnType}`", [cf]: e }], [cf]: o }, { [cg]: bS, rules: [{ [cg]: bT, rules: [{ [cg]: bV, rules: [{ [cg]: bS, rules: [{ [cg]: bV, rules: [aW, { [cg]: bW, rules: [aX, { [cg]: bY, rules: [{ [cg]: bP, rules: [{ [cg]: [{ [ch]: g, [ci]: [aY, "{partitionResult#name}"] }], rules: [{ [cg]: ca, rules: [{ [cg]: [{ [ch]: g, [ci]: [aS, A] }], rules: [{ [cg]: cb, rules: [{ [cg]: cc, rules: [{ [cg]: bA, error: "Access Points do not support S3 Accelerate", [cf]: e }, { [cg]: [W, X], endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: bh, [cs]: ai }, [cf]: n }, { [cg]: [W, aE], endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint-fips.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: bh, [cs]: ai }, [cf]: n }, { [cg]: [aG, X], endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.dualstack.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: bh, [cs]: ai }, [cf]: n }, { [cg]: [aG, aE, Y, ad], endpoint: { [cl]: L, [cm]: bh, [cs]: ai }, [cf]: n }, { [cg]: [aG, aE], endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.s3-accesspoint.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: bh, [cs]: ai }, [cf]: n }], [cf]: o }, bb], [cf]: o }, bc], [cf]: o }, { error: "Invalid ARN: The ARN was not for the S3 service, found: {bucketArn#service}", [cf]: e }], [cf]: o }, bd], [cf]: o }, be], [cf]: o }], [cf]: o }], [cf]: o }, bf], [cf]: o }], [cf]: o }], [cf]: o }, { [cg]: [{ [ch]: x, [ci]: [aT, b] }], rules: [{ [cg]: bz, error: "S3 MRAP does not support dual-stack", [cf]: e }, { [cg]: bG, error: "S3 MRAP does not support FIPS", [cf]: e }, { [cg]: bA, error: "S3 MRAP does not support S3 Accelerate", [cf]: e }, { [cg]: [{ [ch]: d2, [ci]: [{ [cj]: "DisableMultiRegionAccessPoints" }, b] }], error: "Invalid configuration: Multi-Region Access Point ARNs are disabled.", [cf]: e }, { [cg]: [{ [ch]: f, [ci]: bw, [ck]: M }], rules: [{ [cg]: [{ [ch]: g, [ci]: [{ [ch]: h2, [ci]: [{ [cj]: M }, i] }, { [ch]: h2, [ci]: [aQ, "partition"] }] }], rules: [{ endpoint: { [cl]: "https://{accessPointName}.accesspoint.s3-global.{mrapPartition#dnsSuffix}", [cm]: { [co]: [{ [cp]: b, name: y2, [cq]: A, [ct]: bO }] }, [cs]: ai }, [cf]: n }], [cf]: o }, { error: "Client was configured for partition `{mrapPartition#name}` but bucket referred to partition `{bucketArn#partition}`", [cf]: e }], [cf]: o }], [cf]: o }, { error: "Invalid Access Point Name", [cf]: e }], [cf]: o }, bg], [cf]: o }, { [cg]: [{ [ch]: g, [ci]: [aS, z] }], rules: [{ [cg]: bz, error: "S3 Outposts does not support Dual-stack", [cf]: e }, { [cg]: bG, error: "S3 Outposts does not support FIPS", [cf]: e }, { [cg]: bA, error: "S3 Outposts does not support S3 Accelerate", [cf]: e }, { [cg]: [{ [ch]: c, [ci]: [{ [ch]: h2, [ci]: [aQ, "resourceId[4]"] }] }], error: "Invalid Arn: Outpost Access Point ARN contains sub resources", [cf]: e }, { [cg]: [{ [ch]: h2, [ci]: bU, [ck]: w2 }], rules: [{ [cg]: bM, rules: [aX, { [cg]: bY, rules: [{ [cg]: bP, rules: [{ [cg]: bZ, rules: [{ [cg]: ca, rules: [{ [cg]: cb, rules: [{ [cg]: [{ [ch]: h2, [ci]: bX, [ck]: N }], rules: [{ [cg]: [{ [ch]: h2, [ci]: [aQ, "resourceId[3]"], [ck]: K }], rules: [{ [cg]: [{ [ch]: g, [ci]: [{ [cj]: N }, J] }], rules: [{ [cg]: bB, endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.{url#authority}", [cm]: bi, [cs]: ai }, [cf]: n }, { endpoint: { [cl]: "https://{accessPointName}-{bucketArn#accountId}.{outpostId}.s3-outposts.{bucketArn#region}.{bucketPartition#dnsSuffix}", [cm]: bi, [cs]: ai }, [cf]: n }], [cf]: o }, { error: "Expected an outpost type `accesspoint`, found {outpostType}", [cf]: e }], [cf]: o }, { error: "Invalid ARN: expected an access point name", [cf]: e }], [cf]: o }, { error: "Invalid ARN: Expected a 4-component resource", [cf]: e }], [cf]: o }, bc], [cf]: o }, bd], [cf]: o }, be], [cf]: o }], [cf]: o }], [cf]: o }, { error: "Invalid ARN: The outpost Id may only contain a-z, A-Z, 0-9 and `-`. Found: `{outpostId}`", [cf]: e }], [cf]: o }, { error: "Invalid ARN: The Outpost Id was not set", [cf]: e }], [cf]: o }, { error: "Invalid ARN: Unrecognized format: {Bucket} (type: {arnType})", [cf]: e }], [cf]: o }, { error: "Invalid ARN: No ARN type specified", [cf]: e }], [cf]: o }, { [cg]: [{ [ch]: j, [ci]: [ac, 0, 4, a], [ck]: O }, { [ch]: g, [ci]: [{ [cj]: O }, "arn:"] }, { [ch]: r, [ci]: [{ [ch]: c, [ci]: [bj] }] }], error: "Invalid ARN: `{Bucket}` was not a valid ARN", [cf]: e }, { [cg]: [{ [ch]: d2, [ci]: [av, b] }, bj], error: "Path-style addressing cannot be used with ARN buckets", [cf]: e }, { [cg]: bE, rules: [{ [cg]: bP, rules: [{ [cg]: [aw], rules: [{ [cg]: [X, ao, W, ax], endpoint: { [cl]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [X, ao, W, az, aA], rules: [{ endpoint: bk, [cf]: n }], [cf]: o }, { [cg]: [X, ao, W, az, aD], endpoint: bk, [cf]: n }, { [cg]: [aE, ao, W, ax], endpoint: { [cl]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, ao, W, az, aA], rules: [{ endpoint: bl, [cf]: n }], [cf]: o }, { [cg]: [aE, ao, W, az, aD], endpoint: bl, [cf]: n }, { [cg]: [X, ao, aG, ax], endpoint: { [cl]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}/{uri_encoded_bucket}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [X, ao, aG, az, aA], rules: [{ endpoint: bm, [cf]: n }], [cf]: o }, { [cg]: [X, ao, aG, az, aD], endpoint: bm, [cf]: n }, { [cg]: [aE, Y, ad, aG, ax], endpoint: { [cl]: P, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, Y, ad, aG, az, aA], rules: [{ [cg]: bR, endpoint: bn, [cf]: n }, { endpoint: bn, [cf]: n }], [cf]: o }, { [cg]: [aE, Y, ad, aG, az, aD], endpoint: bn, [cf]: n }, { [cg]: [aE, ao, aG, ax], endpoint: { [cl]: Q, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aE, ao, aG, az, aA], rules: [{ [cg]: bR, endpoint: { [cl]: Q, [cm]: aC, [cs]: ai }, [cf]: n }, { endpoint: bo, [cf]: n }], [cf]: o }, { [cg]: [aE, ao, aG, az, aD], endpoint: bo, [cf]: n }], [cf]: o }, { error: "Path-style addressing cannot be used with S3 Accelerate", [cf]: e }], [cf]: o }], [cf]: o }], [cf]: o }, { [cg]: [{ [ch]: c, [ci]: [bp] }, { [ch]: d2, [ci]: [bp, b] }], rules: [{ [cg]: bP, rules: [{ [cg]: cd, rules: [aU, aV, { [cg]: bB, endpoint: { [cl]: s2, [cm]: bq, [cs]: ai }, [cf]: n }, { [cg]: bG, endpoint: { [cl]: "https://s3-object-lambda-fips.{Region}.{partitionResult#dnsSuffix}", [cm]: bq, [cs]: ai }, [cf]: n }, { endpoint: { [cl]: "https://s3-object-lambda.{Region}.{partitionResult#dnsSuffix}", [cm]: bq, [cs]: ai }, [cf]: n }], [cf]: o }, aP], [cf]: o }], [cf]: o }, { [cg]: [aq], rules: [{ [cg]: bP, rules: [{ [cg]: cd, rules: [{ [cg]: [W, X, ao, ax], endpoint: { [cl]: "https://s3-fips.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [W, X, ao, az, aA], rules: [{ endpoint: br, [cf]: n }], [cf]: o }, { [cg]: [W, X, ao, az, aD], endpoint: br, [cf]: n }, { [cg]: [W, aE, ao, ax], endpoint: { [cl]: "https://s3-fips.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [W, aE, ao, az, aA], rules: [{ endpoint: bs, [cf]: n }], [cf]: o }, { [cg]: [W, aE, ao, az, aD], endpoint: bs, [cf]: n }, { [cg]: [aG, X, ao, ax], endpoint: { [cl]: "https://s3.dualstack.us-east-1.{partitionResult#dnsSuffix}", [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aG, X, ao, az, aA], rules: [{ endpoint: bt, [cf]: n }], [cf]: o }, { [cg]: [aG, X, ao, az, aD], endpoint: bt, [cf]: n }, { [cg]: [aG, aE, Y, ad, ax], endpoint: { [cl]: s2, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aG, aE, Y, ad, az, aA], rules: [{ [cg]: bR, endpoint: bu, [cf]: n }, { endpoint: bu, [cf]: n }], [cf]: o }, { [cg]: [aG, aE, Y, ad, az, aD], endpoint: bu, [cf]: n }, { [cg]: [aG, aE, ao, ax], endpoint: { [cl]: R, [cm]: ay, [cs]: ai }, [cf]: n }, { [cg]: [aG, aE, ao, az, aA], rules: [{ [cg]: bR, endpoint: { [cl]: R, [cm]: aC, [cs]: ai }, [cf]: n }, { endpoint: bv, [cf]: n }], [cf]: o }, { [cg]: [aG, aE, ao, az, aD], endpoint: bv, [cf]: n }], [cf]: o }, aP], [cf]: o }], [cf]: o }], [cf]: o }, { error: "A region must be set when sending requests to S3.", [cf]: e }] };
  var ruleSet = _data;

  // node_modules/@aws-sdk/client-s3/dist-es/endpoint/endpointResolver.js
  var defaultEndpointResolver = (endpointParams, context = {}) => {
    return resolveEndpoint(ruleSet, {
      endpointParams,
      logger: context.logger
    });
  };
  customEndpointFunctions.aws = awsEndpointFunctions;

  // node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthSchemeProvider.js
  var createEndpointRuleSetHttpAuthSchemeParametersProvider = (defaultHttpAuthSchemeParametersProvider) => async (config2, context, input) => {
    if (!input) {
      throw new Error(`Could not find \`input\` for \`defaultEndpointRuleSetHttpAuthSchemeParametersProvider\``);
    }
    const defaultParameters = await defaultHttpAuthSchemeParametersProvider(config2, context, input);
    const instructionsFn = getSmithyContext(context)?.commandInstance?.constructor?.getEndpointParameterInstructions;
    if (!instructionsFn) {
      throw new Error(`getEndpointParameterInstructions() is not defined on \`${context.commandName}\``);
    }
    const endpointParameters = await resolveParams(input, { getEndpointParameterInstructions: instructionsFn }, config2);
    return Object.assign(defaultParameters, endpointParameters);
  };
  var _defaultS3HttpAuthSchemeParametersProvider = async (config2, context, input) => {
    return {
      operation: getSmithyContext(context).operation,
      region: await normalizeProvider(config2.region)() || (() => {
        throw new Error("expected `region` to be configured for `aws.auth#sigv4`");
      })()
    };
  };
  var defaultS3HttpAuthSchemeParametersProvider = createEndpointRuleSetHttpAuthSchemeParametersProvider(_defaultS3HttpAuthSchemeParametersProvider);
  function createAwsAuthSigv4HttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4",
      signingProperties: {
        name: "s3",
        region: authParameters.region
      },
      propertiesExtractor: (config2, context) => ({
        signingProperties: {
          config: config2,
          context
        }
      })
    };
  }
  function createAwsAuthSigv4aHttpAuthOption(authParameters) {
    return {
      schemeId: "aws.auth#sigv4a",
      signingProperties: {
        name: "s3",
        region: authParameters.region
      },
      propertiesExtractor: (config2, context) => ({
        signingProperties: {
          config: config2,
          context
        }
      })
    };
  }
  var createEndpointRuleSetHttpAuthSchemeProvider = (defaultEndpointResolver2, defaultHttpAuthSchemeResolver, createHttpAuthOptionFunctions) => {
    const endpointRuleSetHttpAuthSchemeProvider = (authParameters) => {
      const endpoint = defaultEndpointResolver2(authParameters);
      const authSchemes = endpoint.properties?.authSchemes;
      if (!authSchemes) {
        return defaultHttpAuthSchemeResolver(authParameters);
      }
      const options = [];
      for (const scheme of authSchemes) {
        const { name: resolvedName, properties = {}, ...rest } = scheme;
        const name = resolvedName.toLowerCase();
        if (resolvedName !== name) {
          console.warn(`HttpAuthScheme has been normalized with lowercasing: \`${resolvedName}\` to \`${name}\``);
        }
        let schemeId;
        if (name === "sigv4a") {
          schemeId = "aws.auth#sigv4a";
          const sigv4Present = authSchemes.find((s3) => {
            const name2 = s3.name.toLowerCase();
            return name2 !== "sigv4a" && name2.startsWith("sigv4");
          });
          if (!signatureV4CrtContainer.CrtSignerV4 && sigv4Present) {
            continue;
          }
        } else if (name.startsWith("sigv4")) {
          schemeId = "aws.auth#sigv4";
        } else {
          throw new Error(`Unknown HttpAuthScheme found in \`@smithy.rules#endpointRuleSet\`: \`${name}\``);
        }
        const createOption = createHttpAuthOptionFunctions[schemeId];
        if (!createOption) {
          throw new Error(`Could not find HttpAuthOption create function for \`${schemeId}\``);
        }
        const option = createOption(authParameters);
        option.schemeId = schemeId;
        option.signingProperties = { ...option.signingProperties || {}, ...rest, ...properties };
        options.push(option);
      }
      return options;
    };
    return endpointRuleSetHttpAuthSchemeProvider;
  };
  var _defaultS3HttpAuthSchemeProvider = (authParameters) => {
    const options = [];
    switch (authParameters.operation) {
      default: {
        options.push(createAwsAuthSigv4HttpAuthOption(authParameters));
        options.push(createAwsAuthSigv4aHttpAuthOption(authParameters));
      }
    }
    return options;
  };
  var defaultS3HttpAuthSchemeProvider = createEndpointRuleSetHttpAuthSchemeProvider(defaultEndpointResolver, _defaultS3HttpAuthSchemeProvider, {
    "aws.auth#sigv4": createAwsAuthSigv4HttpAuthOption,
    "aws.auth#sigv4a": createAwsAuthSigv4aHttpAuthOption
  });
  var resolveHttpAuthSchemeConfig = (config2) => {
    const config_0 = resolveAwsSdkSigV4Config(config2);
    return {
      ...config_0
    };
  };

  // node_modules/@aws-sdk/client-s3/dist-es/endpoint/EndpointParameters.js
  var resolveClientEndpointParameters = (options) => {
    return {
      ...options,
      useFipsEndpoint: options.useFipsEndpoint ?? false,
      useDualstackEndpoint: options.useDualstackEndpoint ?? false,
      forcePathStyle: options.forcePathStyle ?? false,
      useAccelerateEndpoint: options.useAccelerateEndpoint ?? false,
      useGlobalEndpoint: options.useGlobalEndpoint ?? false,
      disableMultiregionAccessPoints: options.disableMultiregionAccessPoints ?? false,
      defaultSigningName: "s3"
    };
  };
  var commonParams = {
    ForcePathStyle: { type: "clientContextParams", name: "forcePathStyle" },
    UseArnRegion: { type: "clientContextParams", name: "useArnRegion" },
    DisableMultiRegionAccessPoints: { type: "clientContextParams", name: "disableMultiregionAccessPoints" },
    Accelerate: { type: "clientContextParams", name: "useAccelerateEndpoint" },
    DisableS3ExpressSessionAuth: { type: "clientContextParams", name: "disableS3ExpressSessionAuth" },
    UseGlobalEndpoint: { type: "builtInParams", name: "useGlobalEndpoint" },
    UseFIPS: { type: "builtInParams", name: "useFipsEndpoint" },
    Endpoint: { type: "builtInParams", name: "endpoint" },
    Region: { type: "builtInParams", name: "region" },
    UseDualStack: { type: "builtInParams", name: "useDualstackEndpoint" }
  };

  // node_modules/@aws-sdk/client-s3/dist-es/models/S3ServiceException.js
  var S3ServiceException = class extends ServiceException {
    constructor(options) {
      super(options);
      Object.setPrototypeOf(this, S3ServiceException.prototype);
    }
  };

  // node_modules/@aws-sdk/client-s3/dist-es/models/models_0.js
  var NoSuchUpload = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "NoSuchUpload",
        $fault: "client",
        ...opts
      });
      this.name = "NoSuchUpload";
      this.$fault = "client";
      Object.setPrototypeOf(this, NoSuchUpload.prototype);
    }
  };
  var ObjectNotInActiveTierError = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "ObjectNotInActiveTierError",
        $fault: "client",
        ...opts
      });
      this.name = "ObjectNotInActiveTierError";
      this.$fault = "client";
      Object.setPrototypeOf(this, ObjectNotInActiveTierError.prototype);
    }
  };
  var BucketAlreadyExists = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "BucketAlreadyExists",
        $fault: "client",
        ...opts
      });
      this.name = "BucketAlreadyExists";
      this.$fault = "client";
      Object.setPrototypeOf(this, BucketAlreadyExists.prototype);
    }
  };
  var BucketAlreadyOwnedByYou = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "BucketAlreadyOwnedByYou",
        $fault: "client",
        ...opts
      });
      this.name = "BucketAlreadyOwnedByYou";
      this.$fault = "client";
      Object.setPrototypeOf(this, BucketAlreadyOwnedByYou.prototype);
    }
  };
  var NoSuchBucket = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "NoSuchBucket",
        $fault: "client",
        ...opts
      });
      this.name = "NoSuchBucket";
      this.$fault = "client";
      Object.setPrototypeOf(this, NoSuchBucket.prototype);
    }
  };
  var AnalyticsFilter;
  (function(AnalyticsFilter2) {
    AnalyticsFilter2.visit = (value, visitor) => {
      if (value.Prefix !== void 0)
        return visitor.Prefix(value.Prefix);
      if (value.Tag !== void 0)
        return visitor.Tag(value.Tag);
      if (value.And !== void 0)
        return visitor.And(value.And);
      return visitor._(value.$unknown[0], value.$unknown[1]);
    };
  })(AnalyticsFilter || (AnalyticsFilter = {}));
  var LifecycleRuleFilter;
  (function(LifecycleRuleFilter2) {
    LifecycleRuleFilter2.visit = (value, visitor) => {
      if (value.Prefix !== void 0)
        return visitor.Prefix(value.Prefix);
      if (value.Tag !== void 0)
        return visitor.Tag(value.Tag);
      if (value.ObjectSizeGreaterThan !== void 0)
        return visitor.ObjectSizeGreaterThan(value.ObjectSizeGreaterThan);
      if (value.ObjectSizeLessThan !== void 0)
        return visitor.ObjectSizeLessThan(value.ObjectSizeLessThan);
      if (value.And !== void 0)
        return visitor.And(value.And);
      return visitor._(value.$unknown[0], value.$unknown[1]);
    };
  })(LifecycleRuleFilter || (LifecycleRuleFilter = {}));
  var MetricsFilter;
  (function(MetricsFilter2) {
    MetricsFilter2.visit = (value, visitor) => {
      if (value.Prefix !== void 0)
        return visitor.Prefix(value.Prefix);
      if (value.Tag !== void 0)
        return visitor.Tag(value.Tag);
      if (value.AccessPointArn !== void 0)
        return visitor.AccessPointArn(value.AccessPointArn);
      if (value.And !== void 0)
        return visitor.And(value.And);
      return visitor._(value.$unknown[0], value.$unknown[1]);
    };
  })(MetricsFilter || (MetricsFilter = {}));
  var ReplicationRuleFilter;
  (function(ReplicationRuleFilter2) {
    ReplicationRuleFilter2.visit = (value, visitor) => {
      if (value.Prefix !== void 0)
        return visitor.Prefix(value.Prefix);
      if (value.Tag !== void 0)
        return visitor.Tag(value.Tag);
      if (value.And !== void 0)
        return visitor.And(value.And);
      return visitor._(value.$unknown[0], value.$unknown[1]);
    };
  })(ReplicationRuleFilter || (ReplicationRuleFilter = {}));
  var InvalidObjectState = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "InvalidObjectState",
        $fault: "client",
        ...opts
      });
      this.name = "InvalidObjectState";
      this.$fault = "client";
      Object.setPrototypeOf(this, InvalidObjectState.prototype);
      this.StorageClass = opts.StorageClass;
      this.AccessTier = opts.AccessTier;
    }
  };
  var NoSuchKey = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "NoSuchKey",
        $fault: "client",
        ...opts
      });
      this.name = "NoSuchKey";
      this.$fault = "client";
      Object.setPrototypeOf(this, NoSuchKey.prototype);
    }
  };
  var NotFound = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "NotFound",
        $fault: "client",
        ...opts
      });
      this.name = "NotFound";
      this.$fault = "client";
      Object.setPrototypeOf(this, NotFound.prototype);
    }
  };
  var SessionCredentialsFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.SecretAccessKey && { SecretAccessKey: SENSITIVE_STRING },
    ...obj.SessionToken && { SessionToken: SENSITIVE_STRING }
  });
  var CreateSessionOutputFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.Credentials && { Credentials: SessionCredentialsFilterSensitiveLog(obj.Credentials) }
  });
  var HeadObjectOutputFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.SSEKMSKeyId && { SSEKMSKeyId: SENSITIVE_STRING }
  });
  var HeadObjectRequestFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.SSECustomerKey && { SSECustomerKey: SENSITIVE_STRING }
  });

  // node_modules/@aws-sdk/client-s3/dist-es/models/models_1.js
  var ObjectAlreadyInActiveTierError = class extends S3ServiceException {
    constructor(opts) {
      super({
        name: "ObjectAlreadyInActiveTierError",
        $fault: "client",
        ...opts
      });
      this.name = "ObjectAlreadyInActiveTierError";
      this.$fault = "client";
      Object.setPrototypeOf(this, ObjectAlreadyInActiveTierError.prototype);
    }
  };
  var SelectObjectContentEventStream;
  (function(SelectObjectContentEventStream2) {
    SelectObjectContentEventStream2.visit = (value, visitor) => {
      if (value.Records !== void 0)
        return visitor.Records(value.Records);
      if (value.Stats !== void 0)
        return visitor.Stats(value.Stats);
      if (value.Progress !== void 0)
        return visitor.Progress(value.Progress);
      if (value.Cont !== void 0)
        return visitor.Cont(value.Cont);
      if (value.End !== void 0)
        return visitor.End(value.End);
      return visitor._(value.$unknown[0], value.$unknown[1]);
    };
  })(SelectObjectContentEventStream || (SelectObjectContentEventStream = {}));
  var PutObjectOutputFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.SSEKMSKeyId && { SSEKMSKeyId: SENSITIVE_STRING },
    ...obj.SSEKMSEncryptionContext && { SSEKMSEncryptionContext: SENSITIVE_STRING }
  });
  var PutObjectRequestFilterSensitiveLog = (obj) => ({
    ...obj,
    ...obj.SSECustomerKey && { SSECustomerKey: SENSITIVE_STRING },
    ...obj.SSEKMSKeyId && { SSEKMSKeyId: SENSITIVE_STRING },
    ...obj.SSEKMSEncryptionContext && { SSEKMSEncryptionContext: SENSITIVE_STRING }
  });

  // node_modules/@aws-sdk/client-s3/dist-es/protocols/Aws_restXml.js
  var se_CreateSessionCommand = async (input, context) => {
    const b2 = requestBuilder(input, context);
    const headers = map({}, isSerializableHeaderValue, {
      [_xacsm]: input[_SM]
    });
    b2.bp("/");
    b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
    const query = map({
      [_s]: [, ""]
    });
    let body;
    b2.m("GET").h(headers).q(query).b(body);
    return b2.build();
  };
  var se_HeadObjectCommand = async (input, context) => {
    const b2 = requestBuilder(input, context);
    const headers = map({}, isSerializableHeaderValue, {
      [_im]: input[_IM],
      [_ims]: [() => isSerializableHeaderValue(input[_IMS]), () => dateToUtcString(input[_IMS]).toString()],
      [_inm]: input[_INM],
      [_ius]: [() => isSerializableHeaderValue(input[_IUS]), () => dateToUtcString(input[_IUS]).toString()],
      [_ra]: input[_R],
      [_xasseca]: input[_SSECA],
      [_xasseck]: input[_SSECK],
      [_xasseckm]: input[_SSECKMD],
      [_xarp]: input[_RP],
      [_xaebo]: input[_EBO],
      [_xacm]: input[_CM]
    });
    b2.bp("/{Key+}");
    b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
    b2.p("Key", () => input.Key, "{Key+}", true);
    const query = map({
      [_rcc]: [, input[_RCC]],
      [_rcd]: [, input[_RCD]],
      [_rce]: [, input[_RCE]],
      [_rcl]: [, input[_RCL]],
      [_rct]: [, input[_RCT]],
      [_re]: [() => input.ResponseExpires !== void 0, () => dateToUtcString(input[_RE]).toString()],
      [_vI]: [, input[_VI]],
      [_pN]: [() => input.PartNumber !== void 0, () => input[_PN].toString()]
    });
    let body;
    b2.m("HEAD").h(headers).q(query).b(body);
    return b2.build();
  };
  var se_PutObjectCommand = async (input, context) => {
    const b2 = requestBuilder(input, context);
    const headers = map({}, isSerializableHeaderValue, {
      [_ct]: input[_CT] || "application/octet-stream",
      [_xaa]: input[_ACL],
      [_cc]: input[_CC],
      [_cd]: input[_CD],
      [_ce]: input[_CE],
      [_cl]: input[_CL],
      [_cl_]: [() => isSerializableHeaderValue(input[_CLo]), () => input[_CLo].toString()],
      [_cm]: input[_CMD],
      [_xasca]: input[_CA],
      [_xacc]: input[_CCRC],
      [_xacc_]: input[_CCRCC],
      [_xacs]: input[_CSHA],
      [_xacs_]: input[_CSHAh],
      [_e]: [() => isSerializableHeaderValue(input[_E]), () => dateToUtcString(input[_E]).toString()],
      [_xagfc]: input[_GFC],
      [_xagr]: input[_GR],
      [_xagra]: input[_GRACP],
      [_xagwa]: input[_GWACP],
      [_xasse]: input[_SSE],
      [_xasc]: input[_SC],
      [_xawrl]: input[_WRL],
      [_xasseca]: input[_SSECA],
      [_xasseck]: input[_SSECK],
      [_xasseckm]: input[_SSECKMD],
      [_xasseakki]: input[_SSEKMSKI],
      [_xassec]: input[_SSEKMSEC],
      [_xassebke]: [() => isSerializableHeaderValue(input[_BKE]), () => input[_BKE].toString()],
      [_xarp]: input[_RP],
      [_xat]: input[_T],
      [_xaolm]: input[_OLM],
      [_xaolrud]: [() => isSerializableHeaderValue(input[_OLRUD]), () => serializeDateTime(input[_OLRUD]).toString()],
      [_xaollh]: input[_OLLHS],
      [_xaebo]: input[_EBO],
      ...input.Metadata !== void 0 && Object.keys(input.Metadata).reduce((acc, suffix) => {
        acc[`x-amz-meta-${suffix.toLowerCase()}`] = input.Metadata[suffix];
        return acc;
      }, {})
    });
    b2.bp("/{Key+}");
    b2.p("Bucket", () => input.Bucket, "{Bucket}", false);
    b2.p("Key", () => input.Key, "{Key+}", true);
    const query = map({
      [_xi]: [, "PutObject"]
    });
    let body;
    let contents;
    if (input.Body !== void 0) {
      contents = input.Body;
      body = contents;
    }
    b2.m("PUT").h(headers).q(query).b(body);
    return b2.build();
  };
  var de_CreateSessionCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
      return de_CommandError(output, context);
    }
    const contents = map({
      $metadata: deserializeMetadata2(output)
    });
    const data = expectNonNull(expectObject(await parseXmlBody(output.body, context)), "body");
    if (data[_C] != null) {
      contents[_C] = de_SessionCredentials(data[_C], context);
    }
    return contents;
  };
  var de_HeadObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
      return de_CommandError(output, context);
    }
    const contents = map({
      $metadata: deserializeMetadata2(output),
      [_DM]: [() => void 0 !== output.headers[_xadm], () => parseBoolean(output.headers[_xadm])],
      [_AR]: [, output.headers[_ar]],
      [_Exp]: [, output.headers[_xae]],
      [_Re]: [, output.headers[_xar]],
      [_AS]: [, output.headers[_xaas]],
      [_LM]: [() => void 0 !== output.headers[_lm], () => expectNonNull(parseRfc7231DateTime(output.headers[_lm]))],
      [_CLo]: [() => void 0 !== output.headers[_cl_], () => strictParseLong(output.headers[_cl_])],
      [_CCRC]: [, output.headers[_xacc]],
      [_CCRCC]: [, output.headers[_xacc_]],
      [_CSHA]: [, output.headers[_xacs]],
      [_CSHAh]: [, output.headers[_xacs_]],
      [_ETa]: [, output.headers[_eta]],
      [_MM]: [() => void 0 !== output.headers[_xamm], () => strictParseInt32(output.headers[_xamm])],
      [_VI]: [, output.headers[_xavi]],
      [_CC]: [, output.headers[_cc]],
      [_CD]: [, output.headers[_cd]],
      [_CE]: [, output.headers[_ce]],
      [_CL]: [, output.headers[_cl]],
      [_CT]: [, output.headers[_ct]],
      [_E]: [() => void 0 !== output.headers[_e], () => expectNonNull(parseRfc7231DateTime(output.headers[_e]))],
      [_ES]: [, output.headers[_ex]],
      [_WRL]: [, output.headers[_xawrl]],
      [_SSE]: [, output.headers[_xasse]],
      [_SSECA]: [, output.headers[_xasseca]],
      [_SSECKMD]: [, output.headers[_xasseckm]],
      [_SSEKMSKI]: [, output.headers[_xasseakki]],
      [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
      [_SC]: [, output.headers[_xasc]],
      [_RC]: [, output.headers[_xarc]],
      [_RS]: [, output.headers[_xars]],
      [_PC]: [() => void 0 !== output.headers[_xampc], () => strictParseInt32(output.headers[_xampc])],
      [_OLM]: [, output.headers[_xaolm]],
      [_OLRUD]: [
        () => void 0 !== output.headers[_xaolrud],
        () => expectNonNull(parseRfc3339DateTimeWithOffset(output.headers[_xaolrud]))
      ],
      [_OLLHS]: [, output.headers[_xaollh]],
      Metadata: [
        ,
        Object.keys(output.headers).filter((header) => header.startsWith("x-amz-meta-")).reduce((acc, header) => {
          acc[header.substring(11)] = output.headers[header];
          return acc;
        }, {})
      ]
    });
    await collectBody(output.body, context);
    return contents;
  };
  var de_PutObjectCommand = async (output, context) => {
    if (output.statusCode !== 200 && output.statusCode >= 300) {
      return de_CommandError(output, context);
    }
    const contents = map({
      $metadata: deserializeMetadata2(output),
      [_Exp]: [, output.headers[_xae]],
      [_ETa]: [, output.headers[_eta]],
      [_CCRC]: [, output.headers[_xacc]],
      [_CCRCC]: [, output.headers[_xacc_]],
      [_CSHA]: [, output.headers[_xacs]],
      [_CSHAh]: [, output.headers[_xacs_]],
      [_SSE]: [, output.headers[_xasse]],
      [_VI]: [, output.headers[_xavi]],
      [_SSECA]: [, output.headers[_xasseca]],
      [_SSECKMD]: [, output.headers[_xasseckm]],
      [_SSEKMSKI]: [, output.headers[_xasseakki]],
      [_SSEKMSEC]: [, output.headers[_xassec]],
      [_BKE]: [() => void 0 !== output.headers[_xassebke], () => parseBoolean(output.headers[_xassebke])],
      [_RC]: [, output.headers[_xarc]]
    });
    await collectBody(output.body, context);
    return contents;
  };
  var de_CommandError = async (output, context) => {
    const parsedOutput = {
      ...output,
      body: await parseXmlErrorBody(output.body, context)
    };
    const errorCode = loadRestXmlErrorCode(output, parsedOutput.body);
    switch (errorCode) {
      case "NoSuchUpload":
      case "com.amazonaws.s3#NoSuchUpload":
        throw await de_NoSuchUploadRes(parsedOutput, context);
      case "ObjectNotInActiveTierError":
      case "com.amazonaws.s3#ObjectNotInActiveTierError":
        throw await de_ObjectNotInActiveTierErrorRes(parsedOutput, context);
      case "BucketAlreadyExists":
      case "com.amazonaws.s3#BucketAlreadyExists":
        throw await de_BucketAlreadyExistsRes(parsedOutput, context);
      case "BucketAlreadyOwnedByYou":
      case "com.amazonaws.s3#BucketAlreadyOwnedByYou":
        throw await de_BucketAlreadyOwnedByYouRes(parsedOutput, context);
      case "NoSuchBucket":
      case "com.amazonaws.s3#NoSuchBucket":
        throw await de_NoSuchBucketRes(parsedOutput, context);
      case "InvalidObjectState":
      case "com.amazonaws.s3#InvalidObjectState":
        throw await de_InvalidObjectStateRes(parsedOutput, context);
      case "NoSuchKey":
      case "com.amazonaws.s3#NoSuchKey":
        throw await de_NoSuchKeyRes(parsedOutput, context);
      case "NotFound":
      case "com.amazonaws.s3#NotFound":
        throw await de_NotFoundRes(parsedOutput, context);
      case "ObjectAlreadyInActiveTierError":
      case "com.amazonaws.s3#ObjectAlreadyInActiveTierError":
        throw await de_ObjectAlreadyInActiveTierErrorRes(parsedOutput, context);
      default:
        const parsedBody = parsedOutput.body;
        return throwDefaultError2({
          output,
          parsedBody,
          errorCode
        });
    }
  };
  var throwDefaultError2 = withBaseException(S3ServiceException);
  var de_BucketAlreadyExistsRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new BucketAlreadyExists({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_BucketAlreadyOwnedByYouRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new BucketAlreadyOwnedByYou({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_InvalidObjectStateRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    if (data[_AT] != null) {
      contents[_AT] = expectString(data[_AT]);
    }
    if (data[_SC] != null) {
      contents[_SC] = expectString(data[_SC]);
    }
    const exception = new InvalidObjectState({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_NoSuchBucketRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new NoSuchBucket({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_NoSuchKeyRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new NoSuchKey({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_NoSuchUploadRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new NoSuchUpload({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_NotFoundRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new NotFound({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_ObjectAlreadyInActiveTierErrorRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new ObjectAlreadyInActiveTierError({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_ObjectNotInActiveTierErrorRes = async (parsedOutput, context) => {
    const contents = map({});
    const data = parsedOutput.body;
    const exception = new ObjectNotInActiveTierError({
      $metadata: deserializeMetadata2(parsedOutput),
      ...contents
    });
    return decorateServiceException(exception, parsedOutput.body);
  };
  var de_SessionCredentials = (output, context) => {
    const contents = {};
    if (output[_AKI] != null) {
      contents[_AKI] = expectString(output[_AKI]);
    }
    if (output[_SAK] != null) {
      contents[_SAK] = expectString(output[_SAK]);
    }
    if (output[_ST] != null) {
      contents[_ST] = expectString(output[_ST]);
    }
    if (output[_Exp] != null) {
      contents[_Exp] = expectNonNull(parseRfc3339DateTimeWithOffset(output[_Exp]));
    }
    return contents;
  };
  var deserializeMetadata2 = (output) => ({
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"]
  });
  var isSerializableHeaderValue = (value) => value !== void 0 && value !== null && value !== "" && (!Object.getOwnPropertyNames(value).includes("length") || value.length != 0) && (!Object.getOwnPropertyNames(value).includes("size") || value.size != 0);
  var _ACL = "ACL";
  var _AKI = "AccessKeyId";
  var _AR = "AcceptRanges";
  var _AS = "ArchiveStatus";
  var _AT = "AccessTier";
  var _BKE = "BucketKeyEnabled";
  var _C = "Credentials";
  var _CA = "ChecksumAlgorithm";
  var _CC = "CacheControl";
  var _CCRC = "ChecksumCRC32";
  var _CCRCC = "ChecksumCRC32C";
  var _CD = "ContentDisposition";
  var _CE = "ContentEncoding";
  var _CL = "ContentLanguage";
  var _CLo = "ContentLength";
  var _CM = "ChecksumMode";
  var _CMD = "ContentMD5";
  var _CSHA = "ChecksumSHA1";
  var _CSHAh = "ChecksumSHA256";
  var _CT = "ContentType";
  var _DM = "DeleteMarker";
  var _E = "Expires";
  var _EBO = "ExpectedBucketOwner";
  var _ES = "ExpiresString";
  var _ETa = "ETag";
  var _Exp = "Expiration";
  var _GFC = "GrantFullControl";
  var _GR = "GrantRead";
  var _GRACP = "GrantReadACP";
  var _GWACP = "GrantWriteACP";
  var _IM = "IfMatch";
  var _IMS = "IfModifiedSince";
  var _INM = "IfNoneMatch";
  var _IUS = "IfUnmodifiedSince";
  var _LM = "LastModified";
  var _MM = "MissingMeta";
  var _OLLHS = "ObjectLockLegalHoldStatus";
  var _OLM = "ObjectLockMode";
  var _OLRUD = "ObjectLockRetainUntilDate";
  var _PC = "PartsCount";
  var _PN = "PartNumber";
  var _R = "Range";
  var _RC = "RequestCharged";
  var _RCC = "ResponseCacheControl";
  var _RCD = "ResponseContentDisposition";
  var _RCE = "ResponseContentEncoding";
  var _RCL = "ResponseContentLanguage";
  var _RCT = "ResponseContentType";
  var _RE = "ResponseExpires";
  var _RP = "RequestPayer";
  var _RS = "ReplicationStatus";
  var _Re = "Restore";
  var _SAK = "SecretAccessKey";
  var _SC = "StorageClass";
  var _SM = "SessionMode";
  var _SSE = "ServerSideEncryption";
  var _SSECA = "SSECustomerAlgorithm";
  var _SSECK = "SSECustomerKey";
  var _SSECKMD = "SSECustomerKeyMD5";
  var _SSEKMSEC = "SSEKMSEncryptionContext";
  var _SSEKMSKI = "SSEKMSKeyId";
  var _ST = "SessionToken";
  var _T = "Tagging";
  var _VI = "VersionId";
  var _WRL = "WebsiteRedirectLocation";
  var _ar = "accept-ranges";
  var _cc = "cache-control";
  var _cd = "content-disposition";
  var _ce = "content-encoding";
  var _cl = "content-language";
  var _cl_ = "content-length";
  var _cm = "content-md5";
  var _ct = "content-type";
  var _e = "expires";
  var _eta = "etag";
  var _ex = "expiresstring";
  var _im = "if-match";
  var _ims = "if-modified-since";
  var _inm = "if-none-match";
  var _ius = "if-unmodified-since";
  var _lm = "last-modified";
  var _pN = "partNumber";
  var _ra = "range";
  var _rcc = "response-cache-control";
  var _rcd = "response-content-disposition";
  var _rce = "response-content-encoding";
  var _rcl = "response-content-language";
  var _rct = "response-content-type";
  var _re = "response-expires";
  var _s = "session";
  var _vI = "versionId";
  var _xaa = "x-amz-acl";
  var _xaas = "x-amz-archive-status";
  var _xacc = "x-amz-checksum-crc32";
  var _xacc_ = "x-amz-checksum-crc32c";
  var _xacm = "x-amz-checksum-mode";
  var _xacs = "x-amz-checksum-sha1";
  var _xacs_ = "x-amz-checksum-sha256";
  var _xacsm = "x-amz-create-session-mode";
  var _xadm = "x-amz-delete-marker";
  var _xae = "x-amz-expiration";
  var _xaebo = "x-amz-expected-bucket-owner";
  var _xagfc = "x-amz-grant-full-control";
  var _xagr = "x-amz-grant-read";
  var _xagra = "x-amz-grant-read-acp";
  var _xagwa = "x-amz-grant-write-acp";
  var _xamm = "x-amz-missing-meta";
  var _xampc = "x-amz-mp-parts-count";
  var _xaollh = "x-amz-object-lock-legal-hold";
  var _xaolm = "x-amz-object-lock-mode";
  var _xaolrud = "x-amz-object-lock-retain-until-date";
  var _xar = "x-amz-restore";
  var _xarc = "x-amz-request-charged";
  var _xarp = "x-amz-request-payer";
  var _xars = "x-amz-replication-status";
  var _xasc = "x-amz-storage-class";
  var _xasca = "x-amz-sdk-checksum-algorithm";
  var _xasse = "x-amz-server-side-encryption";
  var _xasseakki = "x-amz-server-side-encryption-aws-kms-key-id";
  var _xassebke = "x-amz-server-side-encryption-bucket-key-enabled";
  var _xassec = "x-amz-server-side-encryption-context";
  var _xasseca = "x-amz-server-side-encryption-customer-algorithm";
  var _xasseck = "x-amz-server-side-encryption-customer-key";
  var _xasseckm = "x-amz-server-side-encryption-customer-key-md5";
  var _xat = "x-amz-tagging";
  var _xavi = "x-amz-version-id";
  var _xawrl = "x-amz-website-redirect-location";
  var _xi = "x-id";

  // node_modules/@aws-sdk/client-s3/dist-es/commands/CreateSessionCommand.js
  var CreateSessionCommand = class extends Command.classBuilder().ep({
    ...commonParams,
    DisableS3ExpressSessionAuth: { type: "staticContextParams", value: true },
    Bucket: { type: "contextParams", name: "Bucket" }
  }).m(function(Command2, cs2, config2, o2) {
    return [
      getSerdePlugin(config2, this.serialize, this.deserialize),
      getEndpointPlugin(config2, Command2.getEndpointParameterInstructions()),
      getThrow200ExceptionsPlugin(config2)
    ];
  }).s("AmazonS3", "CreateSession", {}).n("S3Client", "CreateSessionCommand").f(void 0, CreateSessionOutputFilterSensitiveLog).ser(se_CreateSessionCommand).de(de_CreateSessionCommand).build() {
  };

  // node_modules/@aws-sdk/client-s3/package.json
  var package_default = {
    name: "@aws-sdk/client-s3",
    description: "AWS SDK for JavaScript S3 Client for Node.js, Browser and React Native",
    version: "3.627.0",
    scripts: {
      build: "concurrently 'yarn:build:cjs' 'yarn:build:es' 'yarn:build:types'",
      "build:cjs": "node ../../scripts/compilation/inline client-s3",
      "build:es": "tsc -p tsconfig.es.json",
      "build:include:deps": "lerna run --scope $npm_package_name --include-dependencies build",
      "build:types": "tsc -p tsconfig.types.json",
      "build:types:downlevel": "downlevel-dts dist-types dist-types/ts3.4",
      clean: "rimraf ./dist-* && rimraf *.tsbuildinfo",
      "extract:docs": "api-extractor run --local",
      "generate:client": "node ../../scripts/generate-clients/single-service --solo s3",
      test: "yarn test:unit",
      "test:e2e": "yarn test:e2e:node && yarn test:e2e:browser",
      "test:e2e:browser": "ts-mocha test/**/*.browser.ispec.ts && karma start karma.conf.js",
      "test:e2e:node": "jest --c jest.config.e2e.js",
      "test:unit": "ts-mocha test/unit/**/*.spec.ts"
    },
    main: "./dist-cjs/index.js",
    types: "./dist-types/index.d.ts",
    module: "./dist-es/index.js",
    sideEffects: false,
    dependencies: {
      "@aws-crypto/sha1-browser": "5.2.0",
      "@aws-crypto/sha256-browser": "5.2.0",
      "@aws-crypto/sha256-js": "5.2.0",
      "@aws-sdk/client-sso-oidc": "3.624.0",
      "@aws-sdk/client-sts": "3.624.0",
      "@aws-sdk/core": "3.624.0",
      "@aws-sdk/credential-provider-node": "3.624.0",
      "@aws-sdk/middleware-bucket-endpoint": "3.620.0",
      "@aws-sdk/middleware-expect-continue": "3.620.0",
      "@aws-sdk/middleware-flexible-checksums": "3.620.0",
      "@aws-sdk/middleware-host-header": "3.620.0",
      "@aws-sdk/middleware-location-constraint": "3.609.0",
      "@aws-sdk/middleware-logger": "3.609.0",
      "@aws-sdk/middleware-recursion-detection": "3.620.0",
      "@aws-sdk/middleware-sdk-s3": "3.626.0",
      "@aws-sdk/middleware-ssec": "3.609.0",
      "@aws-sdk/middleware-user-agent": "3.620.0",
      "@aws-sdk/region-config-resolver": "3.614.0",
      "@aws-sdk/signature-v4-multi-region": "3.626.0",
      "@aws-sdk/types": "3.609.0",
      "@aws-sdk/util-endpoints": "3.614.0",
      "@aws-sdk/util-user-agent-browser": "3.609.0",
      "@aws-sdk/util-user-agent-node": "3.614.0",
      "@aws-sdk/xml-builder": "3.609.0",
      "@smithy/config-resolver": "^3.0.5",
      "@smithy/core": "^2.3.2",
      "@smithy/eventstream-serde-browser": "^3.0.5",
      "@smithy/eventstream-serde-config-resolver": "^3.0.3",
      "@smithy/eventstream-serde-node": "^3.0.4",
      "@smithy/fetch-http-handler": "^3.2.4",
      "@smithy/hash-blob-browser": "^3.1.2",
      "@smithy/hash-node": "^3.0.3",
      "@smithy/hash-stream-node": "^3.1.2",
      "@smithy/invalid-dependency": "^3.0.3",
      "@smithy/md5-js": "^3.0.3",
      "@smithy/middleware-content-length": "^3.0.5",
      "@smithy/middleware-endpoint": "^3.1.0",
      "@smithy/middleware-retry": "^3.0.14",
      "@smithy/middleware-serde": "^3.0.3",
      "@smithy/middleware-stack": "^3.0.3",
      "@smithy/node-config-provider": "^3.1.4",
      "@smithy/node-http-handler": "^3.1.4",
      "@smithy/protocol-http": "^4.1.0",
      "@smithy/smithy-client": "^3.1.12",
      "@smithy/types": "^3.3.0",
      "@smithy/url-parser": "^3.0.3",
      "@smithy/util-base64": "^3.0.0",
      "@smithy/util-body-length-browser": "^3.0.0",
      "@smithy/util-body-length-node": "^3.0.0",
      "@smithy/util-defaults-mode-browser": "^3.0.14",
      "@smithy/util-defaults-mode-node": "^3.0.14",
      "@smithy/util-endpoints": "^2.0.5",
      "@smithy/util-middleware": "^3.0.3",
      "@smithy/util-retry": "^3.0.3",
      "@smithy/util-stream": "^3.1.3",
      "@smithy/util-utf8": "^3.0.0",
      "@smithy/util-waiter": "^3.1.2",
      tslib: "^2.6.2"
    },
    devDependencies: {
      "@aws-sdk/signature-v4-crt": "3.626.0",
      "@tsconfig/node16": "16.1.3",
      "@types/chai": "^4.2.11",
      "@types/mocha": "^8.0.4",
      "@types/node": "^16.18.96",
      concurrently: "7.0.0",
      "downlevel-dts": "0.10.1",
      rimraf: "3.0.2",
      typescript: "~4.9.5"
    },
    engines: {
      node: ">=16.0.0"
    },
    typesVersions: {
      "<4.0": {
        "dist-types/*": [
          "dist-types/ts3.4/*"
        ]
      }
    },
    files: [
      "dist-*/**"
    ],
    author: {
      name: "AWS SDK for JavaScript Team",
      url: "https://aws.amazon.com/javascript/"
    },
    license: "Apache-2.0",
    browser: {
      "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
    },
    "react-native": {
      "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.native"
    },
    homepage: "https://github.com/aws/aws-sdk-js-v3/tree/main/clients/client-s3",
    repository: {
      type: "git",
      url: "https://github.com/aws/aws-sdk-js-v3.git",
      directory: "clients/client-s3"
    }
  };

  // node_modules/@aws-crypto/sha1-browser/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
  var fromUtf82 = (input) => new TextEncoder().encode(input);

  // node_modules/@aws-crypto/sha1-browser/build/module/isEmptyData.js
  function isEmptyData(data) {
    if (typeof data === "string") {
      return data.length === 0;
    }
    return data.byteLength === 0;
  }

  // node_modules/@aws-crypto/sha1-browser/build/module/constants.js
  var SHA_1_HASH = { name: "SHA-1" };
  var SHA_1_HMAC_ALGO = {
    name: "HMAC",
    hash: SHA_1_HASH
  };
  var EMPTY_DATA_SHA_1 = new Uint8Array([
    218,
    57,
    163,
    238,
    94,
    107,
    75,
    13,
    50,
    85,
    191,
    239,
    149,
    96,
    24,
    144,
    175,
    216,
    7,
    9
  ]);

  // node_modules/@aws-sdk/util-locate-window/dist-es/index.js
  var fallbackWindow = {};
  function locateWindow() {
    if (typeof window !== "undefined") {
      return window;
    } else if (typeof self !== "undefined") {
      return self;
    }
    return fallbackWindow;
  }

  // node_modules/@aws-crypto/sha1-browser/build/module/webCryptoSha1.js
  var Sha1 = (
    /** @class */
    function() {
      function Sha13(secret) {
        this.toHash = new Uint8Array(0);
        if (secret !== void 0) {
          this.key = new Promise(function(resolve, reject) {
            locateWindow().crypto.subtle.importKey("raw", convertToBuffer(secret), SHA_1_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
          });
          this.key.catch(function() {
          });
        }
      }
      Sha13.prototype.update = function(data) {
        if (isEmptyData(data)) {
          return;
        }
        var update = convertToBuffer(data);
        var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
        typedArray.set(this.toHash, 0);
        typedArray.set(update, this.toHash.byteLength);
        this.toHash = typedArray;
      };
      Sha13.prototype.digest = function() {
        var _this = this;
        if (this.key) {
          return this.key.then(function(key) {
            return locateWindow().crypto.subtle.sign(SHA_1_HMAC_ALGO, key, _this.toHash).then(function(data) {
              return new Uint8Array(data);
            });
          });
        }
        if (isEmptyData(this.toHash)) {
          return Promise.resolve(EMPTY_DATA_SHA_1);
        }
        return Promise.resolve().then(function() {
          return locateWindow().crypto.subtle.digest(SHA_1_HASH, _this.toHash);
        }).then(function(data) {
          return Promise.resolve(new Uint8Array(data));
        });
      };
      Sha13.prototype.reset = function() {
        this.toHash = new Uint8Array(0);
      };
      return Sha13;
    }()
  );
  function convertToBuffer(data) {
    if (typeof data === "string") {
      return fromUtf82(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  }

  // node_modules/tslib/tslib.es6.mjs
  function __awaiter(thisArg, _arguments, P2, generator) {
    function adopt(value) {
      return value instanceof P2 ? value : new P2(function(resolve) {
        resolve(value);
      });
    }
    return new (P2 || (P2 = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e2) {
          reject(e2);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t2[0] & 1)
        throw t2[1];
      return t2[1];
    }, trys: [], ops: [] }, f2, y3, t2, g2;
    return g2 = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g2[Symbol.iterator] = function() {
      return this;
    }), g2;
    function verb(n2) {
      return function(v2) {
        return step([n2, v2]);
      };
    }
    function step(op) {
      if (f2)
        throw new TypeError("Generator is already executing.");
      while (g2 && (g2 = 0, op[0] && (_ = 0)), _)
        try {
          if (f2 = 1, y3 && (t2 = op[0] & 2 ? y3["return"] : op[0] ? y3["throw"] || ((t2 = y3["return"]) && t2.call(y3), 0) : y3.next) && !(t2 = t2.call(y3, op[1])).done)
            return t2;
          if (y3 = 0, t2)
            op = [op[0] & 2, t2.value];
          switch (op[0]) {
            case 0:
            case 1:
              t2 = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y3 = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (!(t2 = _.trys, t2 = t2.length > 0 && t2[t2.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t2 || op[1] > t2[0] && op[1] < t2[3])) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t2[1]) {
                _.label = t2[1];
                t2 = op;
                break;
              }
              if (t2 && _.label < t2[2]) {
                _.label = t2[2];
                _.ops.push(op);
                break;
              }
              if (t2[2])
                _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e2) {
          op = [6, e2];
          y3 = 0;
        } finally {
          f2 = t2 = 0;
        }
      if (op[0] & 5)
        throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o2) {
    var s3 = typeof Symbol === "function" && Symbol.iterator, m3 = s3 && o2[s3], i2 = 0;
    if (m3)
      return m3.call(o2);
    if (o2 && typeof o2.length === "number")
      return {
        next: function() {
          if (o2 && i2 >= o2.length)
            o2 = void 0;
          return { value: o2 && o2[i2++], done: !o2 };
        }
      };
    throw new TypeError(s3 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }

  // node_modules/@aws-crypto/supports-web-crypto/build/module/supportsWebCrypto.js
  var subtleCryptoMethods = [
    "decrypt",
    "digest",
    "encrypt",
    "exportKey",
    "generateKey",
    "importKey",
    "sign",
    "verify"
  ];
  function supportsWebCrypto(window2) {
    if (supportsSecureRandom(window2) && typeof window2.crypto.subtle === "object") {
      var subtle = window2.crypto.subtle;
      return supportsSubtleCrypto(subtle);
    }
    return false;
  }
  function supportsSecureRandom(window2) {
    if (typeof window2 === "object" && typeof window2.crypto === "object") {
      var getRandomValues2 = window2.crypto.getRandomValues;
      return typeof getRandomValues2 === "function";
    }
    return false;
  }
  function supportsSubtleCrypto(subtle) {
    return subtle && subtleCryptoMethods.every(function(methodName) {
      return typeof subtle[methodName] === "function";
    });
  }

  // node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
  var fromUtf83 = (input) => new TextEncoder().encode(input);

  // node_modules/@aws-crypto/util/build/module/convertToBuffer.js
  var fromUtf84 = typeof Buffer !== "undefined" && Buffer.from ? function(input) {
    return Buffer.from(input, "utf8");
  } : fromUtf83;
  function convertToBuffer2(data) {
    if (data instanceof Uint8Array)
      return data;
    if (typeof data === "string") {
      return fromUtf84(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  }

  // node_modules/@aws-crypto/util/build/module/isEmptyData.js
  function isEmptyData2(data) {
    if (typeof data === "string") {
      return data.length === 0;
    }
    return data.byteLength === 0;
  }

  // node_modules/@aws-crypto/util/build/module/numToUint8.js
  function numToUint8(num) {
    return new Uint8Array([
      (num & 4278190080) >> 24,
      (num & 16711680) >> 16,
      (num & 65280) >> 8,
      num & 255
    ]);
  }

  // node_modules/@aws-crypto/util/build/module/uint32ArrayFrom.js
  function uint32ArrayFrom(a_lookUpTable2) {
    if (!Uint32Array.from) {
      var return_array = new Uint32Array(a_lookUpTable2.length);
      var a_index = 0;
      while (a_index < a_lookUpTable2.length) {
        return_array[a_index] = a_lookUpTable2[a_index];
        a_index += 1;
      }
      return return_array;
    }
    return Uint32Array.from(a_lookUpTable2);
  }

  // node_modules/@aws-crypto/sha1-browser/build/module/crossPlatformSha1.js
  var Sha12 = (
    /** @class */
    function() {
      function Sha13(secret) {
        if (supportsWebCrypto(locateWindow())) {
          this.hash = new Sha1(secret);
        } else {
          throw new Error("SHA1 not supported");
        }
      }
      Sha13.prototype.update = function(data, encoding) {
        this.hash.update(convertToBuffer2(data));
      };
      Sha13.prototype.digest = function() {
        return this.hash.digest();
      };
      Sha13.prototype.reset = function() {
        this.hash.reset();
      };
      return Sha13;
    }()
  );

  // node_modules/@aws-crypto/sha256-browser/build/module/constants.js
  var SHA_256_HASH = { name: "SHA-256" };
  var SHA_256_HMAC_ALGO = {
    name: "HMAC",
    hash: SHA_256_HASH
  };
  var EMPTY_DATA_SHA_256 = new Uint8Array([
    227,
    176,
    196,
    66,
    152,
    252,
    28,
    20,
    154,
    251,
    244,
    200,
    153,
    111,
    185,
    36,
    39,
    174,
    65,
    228,
    100,
    155,
    147,
    76,
    164,
    149,
    153,
    27,
    120,
    82,
    184,
    85
  ]);

  // node_modules/@aws-crypto/sha256-browser/build/module/webCryptoSha256.js
  var Sha256 = (
    /** @class */
    function() {
      function Sha2564(secret) {
        this.toHash = new Uint8Array(0);
        this.secret = secret;
        this.reset();
      }
      Sha2564.prototype.update = function(data) {
        if (isEmptyData2(data)) {
          return;
        }
        var update = convertToBuffer2(data);
        var typedArray = new Uint8Array(this.toHash.byteLength + update.byteLength);
        typedArray.set(this.toHash, 0);
        typedArray.set(update, this.toHash.byteLength);
        this.toHash = typedArray;
      };
      Sha2564.prototype.digest = function() {
        var _this = this;
        if (this.key) {
          return this.key.then(function(key) {
            return locateWindow().crypto.subtle.sign(SHA_256_HMAC_ALGO, key, _this.toHash).then(function(data) {
              return new Uint8Array(data);
            });
          });
        }
        if (isEmptyData2(this.toHash)) {
          return Promise.resolve(EMPTY_DATA_SHA_256);
        }
        return Promise.resolve().then(function() {
          return locateWindow().crypto.subtle.digest(SHA_256_HASH, _this.toHash);
        }).then(function(data) {
          return Promise.resolve(new Uint8Array(data));
        });
      };
      Sha2564.prototype.reset = function() {
        var _this = this;
        this.toHash = new Uint8Array(0);
        if (this.secret && this.secret !== void 0) {
          this.key = new Promise(function(resolve, reject) {
            locateWindow().crypto.subtle.importKey("raw", convertToBuffer2(_this.secret), SHA_256_HMAC_ALGO, false, ["sign"]).then(resolve, reject);
          });
          this.key.catch(function() {
          });
        }
      };
      return Sha2564;
    }()
  );

  // node_modules/@aws-crypto/sha256-js/build/module/constants.js
  var BLOCK_SIZE = 64;
  var DIGEST_LENGTH = 32;
  var KEY = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
  ]);
  var INIT = [
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ];
  var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;

  // node_modules/@aws-crypto/sha256-js/build/module/RawSha256.js
  var RawSha256 = (
    /** @class */
    function() {
      function RawSha2562() {
        this.state = Int32Array.from(INIT);
        this.temp = new Int32Array(64);
        this.buffer = new Uint8Array(64);
        this.bufferLength = 0;
        this.bytesHashed = 0;
        this.finished = false;
      }
      RawSha2562.prototype.update = function(data) {
        if (this.finished) {
          throw new Error("Attempted to update an already finished hash.");
        }
        var position = 0;
        var byteLength = data.byteLength;
        this.bytesHashed += byteLength;
        if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
          throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        while (byteLength > 0) {
          this.buffer[this.bufferLength++] = data[position++];
          byteLength--;
          if (this.bufferLength === BLOCK_SIZE) {
            this.hashBuffer();
            this.bufferLength = 0;
          }
        }
      };
      RawSha2562.prototype.digest = function() {
        if (!this.finished) {
          var bitsHashed = this.bytesHashed * 8;
          var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
          var undecoratedLength = this.bufferLength;
          bufferView.setUint8(this.bufferLength++, 128);
          if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
            for (var i2 = this.bufferLength; i2 < BLOCK_SIZE; i2++) {
              bufferView.setUint8(i2, 0);
            }
            this.hashBuffer();
            this.bufferLength = 0;
          }
          for (var i2 = this.bufferLength; i2 < BLOCK_SIZE - 8; i2++) {
            bufferView.setUint8(i2, 0);
          }
          bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 4294967296), true);
          bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
          this.hashBuffer();
          this.finished = true;
        }
        var out = new Uint8Array(DIGEST_LENGTH);
        for (var i2 = 0; i2 < 8; i2++) {
          out[i2 * 4] = this.state[i2] >>> 24 & 255;
          out[i2 * 4 + 1] = this.state[i2] >>> 16 & 255;
          out[i2 * 4 + 2] = this.state[i2] >>> 8 & 255;
          out[i2 * 4 + 3] = this.state[i2] >>> 0 & 255;
        }
        return out;
      };
      RawSha2562.prototype.hashBuffer = function() {
        var _a = this, buffer = _a.buffer, state = _a.state;
        var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
        for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
          if (i2 < 16) {
            this.temp[i2] = (buffer[i2 * 4] & 255) << 24 | (buffer[i2 * 4 + 1] & 255) << 16 | (buffer[i2 * 4 + 2] & 255) << 8 | buffer[i2 * 4 + 3] & 255;
          } else {
            var u2 = this.temp[i2 - 2];
            var t1_1 = (u2 >>> 17 | u2 << 15) ^ (u2 >>> 19 | u2 << 13) ^ u2 >>> 10;
            u2 = this.temp[i2 - 15];
            var t2_1 = (u2 >>> 7 | u2 << 25) ^ (u2 >>> 18 | u2 << 14) ^ u2 >>> 3;
            this.temp[i2] = (t1_1 + this.temp[i2 - 7] | 0) + (t2_1 + this.temp[i2 - 16] | 0);
          }
          var t1 = (((state4 >>> 6 | state4 << 26) ^ (state4 >>> 11 | state4 << 21) ^ (state4 >>> 25 | state4 << 7)) + (state4 & state5 ^ ~state4 & state6) | 0) + (state7 + (KEY[i2] + this.temp[i2] | 0) | 0) | 0;
          var t2 = ((state0 >>> 2 | state0 << 30) ^ (state0 >>> 13 | state0 << 19) ^ (state0 >>> 22 | state0 << 10)) + (state0 & state1 ^ state0 & state2 ^ state1 & state2) | 0;
          state7 = state6;
          state6 = state5;
          state5 = state4;
          state4 = state3 + t1 | 0;
          state3 = state2;
          state2 = state1;
          state1 = state0;
          state0 = t1 + t2 | 0;
        }
        state[0] += state0;
        state[1] += state1;
        state[2] += state2;
        state[3] += state3;
        state[4] += state4;
        state[5] += state5;
        state[6] += state6;
        state[7] += state7;
      };
      return RawSha2562;
    }()
  );

  // node_modules/@aws-crypto/sha256-js/build/module/jsSha256.js
  var Sha2562 = (
    /** @class */
    function() {
      function Sha2564(secret) {
        this.secret = secret;
        this.hash = new RawSha256();
        this.reset();
      }
      Sha2564.prototype.update = function(toHash) {
        if (isEmptyData2(toHash) || this.error) {
          return;
        }
        try {
          this.hash.update(convertToBuffer2(toHash));
        } catch (e2) {
          this.error = e2;
        }
      };
      Sha2564.prototype.digestSync = function() {
        if (this.error) {
          throw this.error;
        }
        if (this.outer) {
          if (!this.outer.finished) {
            this.outer.update(this.hash.digest());
          }
          return this.outer.digest();
        }
        return this.hash.digest();
      };
      Sha2564.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, this.digestSync()];
          });
        });
      };
      Sha2564.prototype.reset = function() {
        this.hash = new RawSha256();
        if (this.secret) {
          this.outer = new RawSha256();
          var inner = bufferFromSecret(this.secret);
          var outer = new Uint8Array(BLOCK_SIZE);
          outer.set(inner);
          for (var i2 = 0; i2 < BLOCK_SIZE; i2++) {
            inner[i2] ^= 54;
            outer[i2] ^= 92;
          }
          this.hash.update(inner);
          this.outer.update(outer);
          for (var i2 = 0; i2 < inner.byteLength; i2++) {
            inner[i2] = 0;
          }
        }
      };
      return Sha2564;
    }()
  );
  function bufferFromSecret(secret) {
    var input = convertToBuffer2(secret);
    if (input.byteLength > BLOCK_SIZE) {
      var bufferHash = new RawSha256();
      bufferHash.update(input);
      input = bufferHash.digest();
    }
    var buffer = new Uint8Array(BLOCK_SIZE);
    buffer.set(input);
    return buffer;
  }

  // node_modules/@aws-crypto/sha256-browser/build/module/crossPlatformSha256.js
  var Sha2563 = (
    /** @class */
    function() {
      function Sha2564(secret) {
        if (supportsWebCrypto(locateWindow())) {
          this.hash = new Sha256(secret);
        } else {
          this.hash = new Sha2562(secret);
        }
      }
      Sha2564.prototype.update = function(data, encoding) {
        this.hash.update(convertToBuffer2(data));
      };
      Sha2564.prototype.digest = function() {
        return this.hash.digest();
      };
      Sha2564.prototype.reset = function() {
        this.hash.reset();
      };
      return Sha2564;
    }()
  );

  // node_modules/@aws-sdk/util-user-agent-browser/dist-es/index.js
  var import_bowser = __toESM(require_es5());
  var defaultUserAgent = ({ serviceId, clientVersion }) => async () => {
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent ? import_bowser.default.parse(window.navigator.userAgent) : void 0;
    const sections = [
      ["aws-sdk-js", clientVersion],
      ["ua", "2.0"],
      [`os/${parsedUA?.os?.name || "other"}`, parsedUA?.os?.version],
      ["lang/js"],
      ["md/browser", `${parsedUA?.browser?.name ?? "unknown"}_${parsedUA?.browser?.version ?? "unknown"}`]
    ];
    if (serviceId) {
      sections.push([`api/${serviceId}`, clientVersion]);
    }
    return sections;
  };

  // node_modules/@aws-crypto/crc32/build/module/aws_crc32.js
  var AwsCrc32 = (
    /** @class */
    function() {
      function AwsCrc322() {
        this.crc32 = new Crc32();
      }
      AwsCrc322.prototype.update = function(toHash) {
        if (isEmptyData2(toHash))
          return;
        this.crc32.update(convertToBuffer2(toHash));
      };
      AwsCrc322.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, numToUint8(this.crc32.digest())];
          });
        });
      };
      AwsCrc322.prototype.reset = function() {
        this.crc32 = new Crc32();
      };
      return AwsCrc322;
    }()
  );

  // node_modules/@aws-crypto/crc32/build/module/index.js
  var Crc32 = (
    /** @class */
    function() {
      function Crc322() {
        this.checksum = 4294967295;
      }
      Crc322.prototype.update = function(data) {
        var e_1, _a;
        try {
          for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var byte = data_1_1.value;
            this.checksum = this.checksum >>> 8 ^ lookupTable[(this.checksum ^ byte) & 255];
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return))
              _a.call(data_1);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return this;
      };
      Crc322.prototype.digest = function() {
        return (this.checksum ^ 4294967295) >>> 0;
      };
      return Crc322;
    }()
  );
  var a_lookUpTable = [
    0,
    1996959894,
    3993919788,
    2567524794,
    124634137,
    1886057615,
    3915621685,
    2657392035,
    249268274,
    2044508324,
    3772115230,
    2547177864,
    162941995,
    2125561021,
    3887607047,
    2428444049,
    498536548,
    1789927666,
    4089016648,
    2227061214,
    450548861,
    1843258603,
    4107580753,
    2211677639,
    325883990,
    1684777152,
    4251122042,
    2321926636,
    335633487,
    1661365465,
    4195302755,
    2366115317,
    997073096,
    1281953886,
    3579855332,
    2724688242,
    1006888145,
    1258607687,
    3524101629,
    2768942443,
    901097722,
    1119000684,
    3686517206,
    2898065728,
    853044451,
    1172266101,
    3705015759,
    2882616665,
    651767980,
    1373503546,
    3369554304,
    3218104598,
    565507253,
    1454621731,
    3485111705,
    3099436303,
    671266974,
    1594198024,
    3322730930,
    2970347812,
    795835527,
    1483230225,
    3244367275,
    3060149565,
    1994146192,
    31158534,
    2563907772,
    4023717930,
    1907459465,
    112637215,
    2680153253,
    3904427059,
    2013776290,
    251722036,
    2517215374,
    3775830040,
    2137656763,
    141376813,
    2439277719,
    3865271297,
    1802195444,
    476864866,
    2238001368,
    4066508878,
    1812370925,
    453092731,
    2181625025,
    4111451223,
    1706088902,
    314042704,
    2344532202,
    4240017532,
    1658658271,
    366619977,
    2362670323,
    4224994405,
    1303535960,
    984961486,
    2747007092,
    3569037538,
    1256170817,
    1037604311,
    2765210733,
    3554079995,
    1131014506,
    879679996,
    2909243462,
    3663771856,
    1141124467,
    855842277,
    2852801631,
    3708648649,
    1342533948,
    654459306,
    3188396048,
    3373015174,
    1466479909,
    544179635,
    3110523913,
    3462522015,
    1591671054,
    702138776,
    2966460450,
    3352799412,
    1504918807,
    783551873,
    3082640443,
    3233442989,
    3988292384,
    2596254646,
    62317068,
    1957810842,
    3939845945,
    2647816111,
    81470997,
    1943803523,
    3814918930,
    2489596804,
    225274430,
    2053790376,
    3826175755,
    2466906013,
    167816743,
    2097651377,
    4027552580,
    2265490386,
    503444072,
    1762050814,
    4150417245,
    2154129355,
    426522225,
    1852507879,
    4275313526,
    2312317920,
    282753626,
    1742555852,
    4189708143,
    2394877945,
    397917763,
    1622183637,
    3604390888,
    2714866558,
    953729732,
    1340076626,
    3518719985,
    2797360999,
    1068828381,
    1219638859,
    3624741850,
    2936675148,
    906185462,
    1090812512,
    3747672003,
    2825379669,
    829329135,
    1181335161,
    3412177804,
    3160834842,
    628085408,
    1382605366,
    3423369109,
    3138078467,
    570562233,
    1426400815,
    3317316542,
    2998733608,
    733239954,
    1555261956,
    3268935591,
    3050360625,
    752459403,
    1541320221,
    2607071920,
    3965973030,
    1969922972,
    40735498,
    2617837225,
    3943577151,
    1913087877,
    83908371,
    2512341634,
    3803740692,
    2075208622,
    213261112,
    2463272603,
    3855990285,
    2094854071,
    198958881,
    2262029012,
    4057260610,
    1759359992,
    534414190,
    2176718541,
    4139329115,
    1873836001,
    414664567,
    2282248934,
    4279200368,
    1711684554,
    285281116,
    2405801727,
    4167216745,
    1634467795,
    376229701,
    2685067896,
    3608007406,
    1308918612,
    956543938,
    2808555105,
    3495958263,
    1231636301,
    1047427035,
    2932959818,
    3654703836,
    1088359270,
    936918e3,
    2847714899,
    3736837829,
    1202900863,
    817233897,
    3183342108,
    3401237130,
    1404277552,
    615818150,
    3134207493,
    3453421203,
    1423857449,
    601450431,
    3009837614,
    3294710456,
    1567103746,
    711928724,
    3020668471,
    3272380065,
    1510334235,
    755167117
  ];
  var lookupTable = uint32ArrayFrom(a_lookUpTable);

  // node_modules/@smithy/eventstream-codec/dist-es/Int64.js
  var Int642 = class {
    constructor(bytes) {
      this.bytes = bytes;
      if (bytes.byteLength !== 8) {
        throw new Error("Int64 buffers must be exactly 8 bytes");
      }
    }
    static fromNumber(number) {
      if (number > 9223372036854776e3 || number < -9223372036854776e3) {
        throw new Error(`${number} is too large (or, if negative, too small) to represent as an Int64`);
      }
      const bytes = new Uint8Array(8);
      for (let i2 = 7, remaining = Math.abs(Math.round(number)); i2 > -1 && remaining > 0; i2--, remaining /= 256) {
        bytes[i2] = remaining;
      }
      if (number < 0) {
        negate2(bytes);
      }
      return new Int642(bytes);
    }
    valueOf() {
      const bytes = this.bytes.slice(0);
      const negative = bytes[0] & 128;
      if (negative) {
        negate2(bytes);
      }
      return parseInt(toHex(bytes), 16) * (negative ? -1 : 1);
    }
    toString() {
      return String(this.valueOf());
    }
  };
  function negate2(bytes) {
    for (let i2 = 0; i2 < 8; i2++) {
      bytes[i2] ^= 255;
    }
    for (let i2 = 7; i2 > -1; i2--) {
      bytes[i2]++;
      if (bytes[i2] !== 0)
        break;
    }
  }

  // node_modules/@smithy/eventstream-codec/dist-es/HeaderMarshaller.js
  var HeaderMarshaller = class {
    constructor(toUtf82, fromUtf85) {
      this.toUtf8 = toUtf82;
      this.fromUtf8 = fromUtf85;
    }
    format(headers) {
      const chunks = [];
      for (const headerName of Object.keys(headers)) {
        const bytes = this.fromUtf8(headerName);
        chunks.push(Uint8Array.from([bytes.byteLength]), bytes, this.formatHeaderValue(headers[headerName]));
      }
      const out = new Uint8Array(chunks.reduce((carry, bytes) => carry + bytes.byteLength, 0));
      let position = 0;
      for (const chunk of chunks) {
        out.set(chunk, position);
        position += chunk.byteLength;
      }
      return out;
    }
    formatHeaderValue(header) {
      switch (header.type) {
        case "boolean":
          return Uint8Array.from([header.value ? 0 : 1]);
        case "byte":
          return Uint8Array.from([2, header.value]);
        case "short":
          const shortView = new DataView(new ArrayBuffer(3));
          shortView.setUint8(0, 3);
          shortView.setInt16(1, header.value, false);
          return new Uint8Array(shortView.buffer);
        case "integer":
          const intView = new DataView(new ArrayBuffer(5));
          intView.setUint8(0, 4);
          intView.setInt32(1, header.value, false);
          return new Uint8Array(intView.buffer);
        case "long":
          const longBytes = new Uint8Array(9);
          longBytes[0] = 5;
          longBytes.set(header.value.bytes, 1);
          return longBytes;
        case "binary":
          const binView = new DataView(new ArrayBuffer(3 + header.value.byteLength));
          binView.setUint8(0, 6);
          binView.setUint16(1, header.value.byteLength, false);
          const binBytes = new Uint8Array(binView.buffer);
          binBytes.set(header.value, 3);
          return binBytes;
        case "string":
          const utf8Bytes = this.fromUtf8(header.value);
          const strView = new DataView(new ArrayBuffer(3 + utf8Bytes.byteLength));
          strView.setUint8(0, 7);
          strView.setUint16(1, utf8Bytes.byteLength, false);
          const strBytes = new Uint8Array(strView.buffer);
          strBytes.set(utf8Bytes, 3);
          return strBytes;
        case "timestamp":
          const tsBytes = new Uint8Array(9);
          tsBytes[0] = 8;
          tsBytes.set(Int642.fromNumber(header.value.valueOf()).bytes, 1);
          return tsBytes;
        case "uuid":
          if (!UUID_PATTERN2.test(header.value)) {
            throw new Error(`Invalid UUID received: ${header.value}`);
          }
          const uuidBytes = new Uint8Array(17);
          uuidBytes[0] = 9;
          uuidBytes.set(fromHex(header.value.replace(/\-/g, "")), 1);
          return uuidBytes;
      }
    }
    parse(headers) {
      const out = {};
      let position = 0;
      while (position < headers.byteLength) {
        const nameLength = headers.getUint8(position++);
        const name = this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, nameLength));
        position += nameLength;
        switch (headers.getUint8(position++)) {
          case 0:
            out[name] = {
              type: BOOLEAN_TAG,
              value: true
            };
            break;
          case 1:
            out[name] = {
              type: BOOLEAN_TAG,
              value: false
            };
            break;
          case 2:
            out[name] = {
              type: BYTE_TAG,
              value: headers.getInt8(position++)
            };
            break;
          case 3:
            out[name] = {
              type: SHORT_TAG,
              value: headers.getInt16(position, false)
            };
            position += 2;
            break;
          case 4:
            out[name] = {
              type: INT_TAG,
              value: headers.getInt32(position, false)
            };
            position += 4;
            break;
          case 5:
            out[name] = {
              type: LONG_TAG,
              value: new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8))
            };
            position += 8;
            break;
          case 6:
            const binaryLength = headers.getUint16(position, false);
            position += 2;
            out[name] = {
              type: BINARY_TAG,
              value: new Uint8Array(headers.buffer, headers.byteOffset + position, binaryLength)
            };
            position += binaryLength;
            break;
          case 7:
            const stringLength = headers.getUint16(position, false);
            position += 2;
            out[name] = {
              type: STRING_TAG,
              value: this.toUtf8(new Uint8Array(headers.buffer, headers.byteOffset + position, stringLength))
            };
            position += stringLength;
            break;
          case 8:
            out[name] = {
              type: TIMESTAMP_TAG,
              value: new Date(new Int642(new Uint8Array(headers.buffer, headers.byteOffset + position, 8)).valueOf())
            };
            position += 8;
            break;
          case 9:
            const uuidBytes = new Uint8Array(headers.buffer, headers.byteOffset + position, 16);
            position += 16;
            out[name] = {
              type: UUID_TAG,
              value: `${toHex(uuidBytes.subarray(0, 4))}-${toHex(uuidBytes.subarray(4, 6))}-${toHex(uuidBytes.subarray(6, 8))}-${toHex(uuidBytes.subarray(8, 10))}-${toHex(uuidBytes.subarray(10))}`
            };
            break;
          default:
            throw new Error(`Unrecognized header type tag`);
        }
      }
      return out;
    }
  };
  var HEADER_VALUE_TYPE2;
  (function(HEADER_VALUE_TYPE3) {
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolTrue"] = 0] = "boolTrue";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["boolFalse"] = 1] = "boolFalse";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byte"] = 2] = "byte";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["short"] = 3] = "short";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["integer"] = 4] = "integer";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["long"] = 5] = "long";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["byteArray"] = 6] = "byteArray";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["string"] = 7] = "string";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["timestamp"] = 8] = "timestamp";
    HEADER_VALUE_TYPE3[HEADER_VALUE_TYPE3["uuid"] = 9] = "uuid";
  })(HEADER_VALUE_TYPE2 || (HEADER_VALUE_TYPE2 = {}));
  var BOOLEAN_TAG = "boolean";
  var BYTE_TAG = "byte";
  var SHORT_TAG = "short";
  var INT_TAG = "integer";
  var LONG_TAG = "long";
  var BINARY_TAG = "binary";
  var STRING_TAG = "string";
  var TIMESTAMP_TAG = "timestamp";
  var UUID_TAG = "uuid";
  var UUID_PATTERN2 = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;

  // node_modules/@smithy/eventstream-codec/dist-es/splitMessage.js
  var PRELUDE_MEMBER_LENGTH = 4;
  var PRELUDE_LENGTH = PRELUDE_MEMBER_LENGTH * 2;
  var CHECKSUM_LENGTH = 4;
  var MINIMUM_MESSAGE_LENGTH = PRELUDE_LENGTH + CHECKSUM_LENGTH * 2;
  function splitMessage({ byteLength, byteOffset, buffer }) {
    if (byteLength < MINIMUM_MESSAGE_LENGTH) {
      throw new Error("Provided message too short to accommodate event stream message overhead");
    }
    const view = new DataView(buffer, byteOffset, byteLength);
    const messageLength = view.getUint32(0, false);
    if (byteLength !== messageLength) {
      throw new Error("Reported message length does not match received message length");
    }
    const headerLength = view.getUint32(PRELUDE_MEMBER_LENGTH, false);
    const expectedPreludeChecksum = view.getUint32(PRELUDE_LENGTH, false);
    const expectedMessageChecksum = view.getUint32(byteLength - CHECKSUM_LENGTH, false);
    const checksummer = new Crc32().update(new Uint8Array(buffer, byteOffset, PRELUDE_LENGTH));
    if (expectedPreludeChecksum !== checksummer.digest()) {
      throw new Error(`The prelude checksum specified in the message (${expectedPreludeChecksum}) does not match the calculated CRC32 checksum (${checksummer.digest()})`);
    }
    checksummer.update(new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH, byteLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH)));
    if (expectedMessageChecksum !== checksummer.digest()) {
      throw new Error(`The message checksum (${checksummer.digest()}) did not match the expected value of ${expectedMessageChecksum}`);
    }
    return {
      headers: new DataView(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH, headerLength),
      body: new Uint8Array(buffer, byteOffset + PRELUDE_LENGTH + CHECKSUM_LENGTH + headerLength, messageLength - headerLength - (PRELUDE_LENGTH + CHECKSUM_LENGTH + CHECKSUM_LENGTH))
    };
  }

  // node_modules/@smithy/eventstream-codec/dist-es/EventStreamCodec.js
  var EventStreamCodec = class {
    constructor(toUtf82, fromUtf85) {
      this.headerMarshaller = new HeaderMarshaller(toUtf82, fromUtf85);
      this.messageBuffer = [];
      this.isEndOfStream = false;
    }
    feed(message) {
      this.messageBuffer.push(this.decode(message));
    }
    endOfStream() {
      this.isEndOfStream = true;
    }
    getMessage() {
      const message = this.messageBuffer.pop();
      const isEndOfStream = this.isEndOfStream;
      return {
        getMessage() {
          return message;
        },
        isEndOfStream() {
          return isEndOfStream;
        }
      };
    }
    getAvailableMessages() {
      const messages = this.messageBuffer;
      this.messageBuffer = [];
      const isEndOfStream = this.isEndOfStream;
      return {
        getMessages() {
          return messages;
        },
        isEndOfStream() {
          return isEndOfStream;
        }
      };
    }
    encode({ headers: rawHeaders, body }) {
      const headers = this.headerMarshaller.format(rawHeaders);
      const length = headers.byteLength + body.byteLength + 16;
      const out = new Uint8Array(length);
      const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
      const checksum = new Crc32();
      view.setUint32(0, length, false);
      view.setUint32(4, headers.byteLength, false);
      view.setUint32(8, checksum.update(out.subarray(0, 8)).digest(), false);
      out.set(headers, 12);
      out.set(body, headers.byteLength + 12);
      view.setUint32(length - 4, checksum.update(out.subarray(8, length - 4)).digest(), false);
      return out;
    }
    decode(message) {
      const { headers, body } = splitMessage(message);
      return { headers: this.headerMarshaller.parse(headers), body };
    }
    formatHeaders(rawHeaders) {
      return this.headerMarshaller.format(rawHeaders);
    }
  };

  // node_modules/@smithy/eventstream-codec/dist-es/MessageDecoderStream.js
  var MessageDecoderStream = class {
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async *asyncIterator() {
      for await (const bytes of this.options.inputStream) {
        const decoded = this.options.decoder.decode(bytes);
        yield decoded;
      }
    }
  };

  // node_modules/@smithy/eventstream-codec/dist-es/MessageEncoderStream.js
  var MessageEncoderStream = class {
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async *asyncIterator() {
      for await (const msg of this.options.messageStream) {
        const encoded = this.options.encoder.encode(msg);
        yield encoded;
      }
      if (this.options.includeEndFrame) {
        yield new Uint8Array(0);
      }
    }
  };

  // node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageDecoderStream.js
  var SmithyMessageDecoderStream = class {
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async *asyncIterator() {
      for await (const message of this.options.messageStream) {
        const deserialized = await this.options.deserializer(message);
        if (deserialized === void 0)
          continue;
        yield deserialized;
      }
    }
  };

  // node_modules/@smithy/eventstream-codec/dist-es/SmithyMessageEncoderStream.js
  var SmithyMessageEncoderStream = class {
    constructor(options) {
      this.options = options;
    }
    [Symbol.asyncIterator]() {
      return this.asyncIterator();
    }
    async *asyncIterator() {
      for await (const chunk of this.options.inputStream) {
        const payloadBuf = this.options.serializer(chunk);
        yield payloadBuf;
      }
    }
  };

  // node_modules/@smithy/eventstream-serde-universal/dist-es/getChunkedStream.js
  function getChunkedStream(source) {
    let currentMessageTotalLength = 0;
    let currentMessagePendingLength = 0;
    let currentMessage = null;
    let messageLengthBuffer = null;
    const allocateMessage = (size) => {
      if (typeof size !== "number") {
        throw new Error("Attempted to allocate an event message where size was not a number: " + size);
      }
      currentMessageTotalLength = size;
      currentMessagePendingLength = 4;
      currentMessage = new Uint8Array(size);
      const currentMessageView = new DataView(currentMessage.buffer);
      currentMessageView.setUint32(0, size, false);
    };
    const iterator = async function* () {
      const sourceIterator = source[Symbol.asyncIterator]();
      while (true) {
        const { value, done } = await sourceIterator.next();
        if (done) {
          if (!currentMessageTotalLength) {
            return;
          } else if (currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
          } else {
            throw new Error("Truncated event message received.");
          }
          return;
        }
        const chunkLength = value.length;
        let currentOffset = 0;
        while (currentOffset < chunkLength) {
          if (!currentMessage) {
            const bytesRemaining = chunkLength - currentOffset;
            if (!messageLengthBuffer) {
              messageLengthBuffer = new Uint8Array(4);
            }
            const numBytesForTotal = Math.min(4 - currentMessagePendingLength, bytesRemaining);
            messageLengthBuffer.set(value.slice(currentOffset, currentOffset + numBytesForTotal), currentMessagePendingLength);
            currentMessagePendingLength += numBytesForTotal;
            currentOffset += numBytesForTotal;
            if (currentMessagePendingLength < 4) {
              break;
            }
            allocateMessage(new DataView(messageLengthBuffer.buffer).getUint32(0, false));
            messageLengthBuffer = null;
          }
          const numBytesToWrite = Math.min(currentMessageTotalLength - currentMessagePendingLength, chunkLength - currentOffset);
          currentMessage.set(value.slice(currentOffset, currentOffset + numBytesToWrite), currentMessagePendingLength);
          currentMessagePendingLength += numBytesToWrite;
          currentOffset += numBytesToWrite;
          if (currentMessageTotalLength && currentMessageTotalLength === currentMessagePendingLength) {
            yield currentMessage;
            currentMessage = null;
            currentMessageTotalLength = 0;
            currentMessagePendingLength = 0;
          }
        }
      }
    };
    return {
      [Symbol.asyncIterator]: iterator
    };
  }

  // node_modules/@smithy/eventstream-serde-universal/dist-es/getUnmarshalledStream.js
  function getMessageUnmarshaller(deserializer, toUtf82) {
    return async function(message) {
      const { value: messageType } = message.headers[":message-type"];
      if (messageType === "error") {
        const unmodeledError = new Error(message.headers[":error-message"].value || "UnknownError");
        unmodeledError.name = message.headers[":error-code"].value;
        throw unmodeledError;
      } else if (messageType === "exception") {
        const code = message.headers[":exception-type"].value;
        const exception = { [code]: message };
        const deserializedException = await deserializer(exception);
        if (deserializedException.$unknown) {
          const error = new Error(toUtf82(message.body));
          error.name = code;
          throw error;
        }
        throw deserializedException[code];
      } else if (messageType === "event") {
        const event = {
          [message.headers[":event-type"].value]: message
        };
        const deserialized = await deserializer(event);
        if (deserialized.$unknown)
          return;
        return deserialized;
      } else {
        throw Error(`Unrecognizable event type: ${message.headers[":event-type"].value}`);
      }
    };
  }

  // node_modules/@smithy/eventstream-serde-universal/dist-es/EventStreamMarshaller.js
  var EventStreamMarshaller = class {
    constructor({ utf8Encoder, utf8Decoder }) {
      this.eventStreamCodec = new EventStreamCodec(utf8Encoder, utf8Decoder);
      this.utfEncoder = utf8Encoder;
    }
    deserialize(body, deserializer) {
      const inputStream = getChunkedStream(body);
      return new SmithyMessageDecoderStream({
        messageStream: new MessageDecoderStream({ inputStream, decoder: this.eventStreamCodec }),
        deserializer: getMessageUnmarshaller(deserializer, this.utfEncoder)
      });
    }
    serialize(inputStream, serializer) {
      return new MessageEncoderStream({
        messageStream: new SmithyMessageEncoderStream({ inputStream, serializer }),
        encoder: this.eventStreamCodec,
        includeEndFrame: true
      });
    }
  };

  // node_modules/@smithy/eventstream-serde-browser/dist-es/utils.js
  var readableStreamtoIterable = (readableStream) => ({
    [Symbol.asyncIterator]: async function* () {
      const reader = readableStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            return;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    }
  });
  var iterableToReadableStream = (asyncIterable) => {
    const iterator = asyncIterable[Symbol.asyncIterator]();
    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await iterator.next();
        if (done) {
          return controller.close();
        }
        controller.enqueue(value);
      }
    });
  };

  // node_modules/@smithy/eventstream-serde-browser/dist-es/EventStreamMarshaller.js
  var EventStreamMarshaller2 = class {
    constructor({ utf8Encoder, utf8Decoder }) {
      this.universalMarshaller = new EventStreamMarshaller({
        utf8Decoder,
        utf8Encoder
      });
    }
    deserialize(body, deserializer) {
      const bodyIterable = isReadableStream2(body) ? readableStreamtoIterable(body) : body;
      return this.universalMarshaller.deserialize(bodyIterable, deserializer);
    }
    serialize(input, serializer) {
      const serialziedIterable = this.universalMarshaller.serialize(input, serializer);
      return typeof ReadableStream === "function" ? iterableToReadableStream(serialziedIterable) : serialziedIterable;
    }
  };
  var isReadableStream2 = (body) => typeof ReadableStream === "function" && body instanceof ReadableStream;

  // node_modules/@smithy/eventstream-serde-browser/dist-es/provider.js
  var eventStreamSerdeProvider = (options) => new EventStreamMarshaller2(options);

  // node_modules/@smithy/chunked-blob-reader/dist-es/index.js
  function blobReader(blob, onChunk, chunkSize = 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.addEventListener("error", reject);
      fileReader.addEventListener("abort", reject);
      const size = blob.size;
      let totalBytesRead = 0;
      function read2() {
        if (totalBytesRead >= size) {
          resolve();
          return;
        }
        fileReader.readAsArrayBuffer(blob.slice(totalBytesRead, Math.min(size, totalBytesRead + chunkSize)));
      }
      fileReader.addEventListener("load", (event) => {
        const result = event.target.result;
        onChunk(new Uint8Array(result));
        totalBytesRead += result.byteLength;
        read2();
      });
      read2();
    });
  }

  // node_modules/@smithy/hash-blob-browser/dist-es/index.js
  var blobHasher = async function blobHasher2(hashCtor, blob) {
    const hash = new hashCtor();
    await blobReader(blob, (chunk) => {
      hash.update(chunk);
    });
    return hash.digest();
  };

  // node_modules/@smithy/invalid-dependency/dist-es/invalidProvider.js
  var invalidProvider = (message) => () => Promise.reject(message);

  // node_modules/@smithy/md5-js/dist-es/constants.js
  var BLOCK_SIZE2 = 64;
  var DIGEST_LENGTH2 = 16;
  var INIT2 = [1732584193, 4023233417, 2562383102, 271733878];

  // node_modules/@smithy/md5-js/dist-es/index.js
  var Md5 = class {
    constructor() {
      this.reset();
    }
    update(sourceData) {
      if (isEmptyData3(sourceData)) {
        return;
      } else if (this.finished) {
        throw new Error("Attempted to update an already finished hash.");
      }
      const data = convertToBuffer3(sourceData);
      let position = 0;
      let { byteLength } = data;
      this.bytesHashed += byteLength;
      while (byteLength > 0) {
        this.buffer.setUint8(this.bufferLength++, data[position++]);
        byteLength--;
        if (this.bufferLength === BLOCK_SIZE2) {
          this.hashBuffer();
          this.bufferLength = 0;
        }
      }
    }
    async digest() {
      if (!this.finished) {
        const { buffer, bufferLength: undecoratedLength, bytesHashed } = this;
        const bitsHashed = bytesHashed * 8;
        buffer.setUint8(this.bufferLength++, 128);
        if (undecoratedLength % BLOCK_SIZE2 >= BLOCK_SIZE2 - 8) {
          for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2; i2++) {
            buffer.setUint8(i2, 0);
          }
          this.hashBuffer();
          this.bufferLength = 0;
        }
        for (let i2 = this.bufferLength; i2 < BLOCK_SIZE2 - 8; i2++) {
          buffer.setUint8(i2, 0);
        }
        buffer.setUint32(BLOCK_SIZE2 - 8, bitsHashed >>> 0, true);
        buffer.setUint32(BLOCK_SIZE2 - 4, Math.floor(bitsHashed / 4294967296), true);
        this.hashBuffer();
        this.finished = true;
      }
      const out = new DataView(new ArrayBuffer(DIGEST_LENGTH2));
      for (let i2 = 0; i2 < 4; i2++) {
        out.setUint32(i2 * 4, this.state[i2], true);
      }
      return new Uint8Array(out.buffer, out.byteOffset, out.byteLength);
    }
    hashBuffer() {
      const { buffer, state } = this;
      let a2 = state[0], b2 = state[1], c2 = state[2], d3 = state[3];
      a2 = ff(a2, b2, c2, d3, buffer.getUint32(0, true), 7, 3614090360);
      d3 = ff(d3, a2, b2, c2, buffer.getUint32(4, true), 12, 3905402710);
      c2 = ff(c2, d3, a2, b2, buffer.getUint32(8, true), 17, 606105819);
      b2 = ff(b2, c2, d3, a2, buffer.getUint32(12, true), 22, 3250441966);
      a2 = ff(a2, b2, c2, d3, buffer.getUint32(16, true), 7, 4118548399);
      d3 = ff(d3, a2, b2, c2, buffer.getUint32(20, true), 12, 1200080426);
      c2 = ff(c2, d3, a2, b2, buffer.getUint32(24, true), 17, 2821735955);
      b2 = ff(b2, c2, d3, a2, buffer.getUint32(28, true), 22, 4249261313);
      a2 = ff(a2, b2, c2, d3, buffer.getUint32(32, true), 7, 1770035416);
      d3 = ff(d3, a2, b2, c2, buffer.getUint32(36, true), 12, 2336552879);
      c2 = ff(c2, d3, a2, b2, buffer.getUint32(40, true), 17, 4294925233);
      b2 = ff(b2, c2, d3, a2, buffer.getUint32(44, true), 22, 2304563134);
      a2 = ff(a2, b2, c2, d3, buffer.getUint32(48, true), 7, 1804603682);
      d3 = ff(d3, a2, b2, c2, buffer.getUint32(52, true), 12, 4254626195);
      c2 = ff(c2, d3, a2, b2, buffer.getUint32(56, true), 17, 2792965006);
      b2 = ff(b2, c2, d3, a2, buffer.getUint32(60, true), 22, 1236535329);
      a2 = gg(a2, b2, c2, d3, buffer.getUint32(4, true), 5, 4129170786);
      d3 = gg(d3, a2, b2, c2, buffer.getUint32(24, true), 9, 3225465664);
      c2 = gg(c2, d3, a2, b2, buffer.getUint32(44, true), 14, 643717713);
      b2 = gg(b2, c2, d3, a2, buffer.getUint32(0, true), 20, 3921069994);
      a2 = gg(a2, b2, c2, d3, buffer.getUint32(20, true), 5, 3593408605);
      d3 = gg(d3, a2, b2, c2, buffer.getUint32(40, true), 9, 38016083);
      c2 = gg(c2, d3, a2, b2, buffer.getUint32(60, true), 14, 3634488961);
      b2 = gg(b2, c2, d3, a2, buffer.getUint32(16, true), 20, 3889429448);
      a2 = gg(a2, b2, c2, d3, buffer.getUint32(36, true), 5, 568446438);
      d3 = gg(d3, a2, b2, c2, buffer.getUint32(56, true), 9, 3275163606);
      c2 = gg(c2, d3, a2, b2, buffer.getUint32(12, true), 14, 4107603335);
      b2 = gg(b2, c2, d3, a2, buffer.getUint32(32, true), 20, 1163531501);
      a2 = gg(a2, b2, c2, d3, buffer.getUint32(52, true), 5, 2850285829);
      d3 = gg(d3, a2, b2, c2, buffer.getUint32(8, true), 9, 4243563512);
      c2 = gg(c2, d3, a2, b2, buffer.getUint32(28, true), 14, 1735328473);
      b2 = gg(b2, c2, d3, a2, buffer.getUint32(48, true), 20, 2368359562);
      a2 = hh(a2, b2, c2, d3, buffer.getUint32(20, true), 4, 4294588738);
      d3 = hh(d3, a2, b2, c2, buffer.getUint32(32, true), 11, 2272392833);
      c2 = hh(c2, d3, a2, b2, buffer.getUint32(44, true), 16, 1839030562);
      b2 = hh(b2, c2, d3, a2, buffer.getUint32(56, true), 23, 4259657740);
      a2 = hh(a2, b2, c2, d3, buffer.getUint32(4, true), 4, 2763975236);
      d3 = hh(d3, a2, b2, c2, buffer.getUint32(16, true), 11, 1272893353);
      c2 = hh(c2, d3, a2, b2, buffer.getUint32(28, true), 16, 4139469664);
      b2 = hh(b2, c2, d3, a2, buffer.getUint32(40, true), 23, 3200236656);
      a2 = hh(a2, b2, c2, d3, buffer.getUint32(52, true), 4, 681279174);
      d3 = hh(d3, a2, b2, c2, buffer.getUint32(0, true), 11, 3936430074);
      c2 = hh(c2, d3, a2, b2, buffer.getUint32(12, true), 16, 3572445317);
      b2 = hh(b2, c2, d3, a2, buffer.getUint32(24, true), 23, 76029189);
      a2 = hh(a2, b2, c2, d3, buffer.getUint32(36, true), 4, 3654602809);
      d3 = hh(d3, a2, b2, c2, buffer.getUint32(48, true), 11, 3873151461);
      c2 = hh(c2, d3, a2, b2, buffer.getUint32(60, true), 16, 530742520);
      b2 = hh(b2, c2, d3, a2, buffer.getUint32(8, true), 23, 3299628645);
      a2 = ii(a2, b2, c2, d3, buffer.getUint32(0, true), 6, 4096336452);
      d3 = ii(d3, a2, b2, c2, buffer.getUint32(28, true), 10, 1126891415);
      c2 = ii(c2, d3, a2, b2, buffer.getUint32(56, true), 15, 2878612391);
      b2 = ii(b2, c2, d3, a2, buffer.getUint32(20, true), 21, 4237533241);
      a2 = ii(a2, b2, c2, d3, buffer.getUint32(48, true), 6, 1700485571);
      d3 = ii(d3, a2, b2, c2, buffer.getUint32(12, true), 10, 2399980690);
      c2 = ii(c2, d3, a2, b2, buffer.getUint32(40, true), 15, 4293915773);
      b2 = ii(b2, c2, d3, a2, buffer.getUint32(4, true), 21, 2240044497);
      a2 = ii(a2, b2, c2, d3, buffer.getUint32(32, true), 6, 1873313359);
      d3 = ii(d3, a2, b2, c2, buffer.getUint32(60, true), 10, 4264355552);
      c2 = ii(c2, d3, a2, b2, buffer.getUint32(24, true), 15, 2734768916);
      b2 = ii(b2, c2, d3, a2, buffer.getUint32(52, true), 21, 1309151649);
      a2 = ii(a2, b2, c2, d3, buffer.getUint32(16, true), 6, 4149444226);
      d3 = ii(d3, a2, b2, c2, buffer.getUint32(44, true), 10, 3174756917);
      c2 = ii(c2, d3, a2, b2, buffer.getUint32(8, true), 15, 718787259);
      b2 = ii(b2, c2, d3, a2, buffer.getUint32(36, true), 21, 3951481745);
      state[0] = a2 + state[0] & 4294967295;
      state[1] = b2 + state[1] & 4294967295;
      state[2] = c2 + state[2] & 4294967295;
      state[3] = d3 + state[3] & 4294967295;
    }
    reset() {
      this.state = Uint32Array.from(INIT2);
      this.buffer = new DataView(new ArrayBuffer(BLOCK_SIZE2));
      this.bufferLength = 0;
      this.bytesHashed = 0;
      this.finished = false;
    }
  };
  function cmn(q2, a2, b2, x2, s3, t2) {
    a2 = (a2 + q2 & 4294967295) + (x2 + t2 & 4294967295) & 4294967295;
    return (a2 << s3 | a2 >>> 32 - s3) + b2 & 4294967295;
  }
  function ff(a2, b2, c2, d3, x2, s3, t2) {
    return cmn(b2 & c2 | ~b2 & d3, a2, b2, x2, s3, t2);
  }
  function gg(a2, b2, c2, d3, x2, s3, t2) {
    return cmn(b2 & d3 | c2 & ~d3, a2, b2, x2, s3, t2);
  }
  function hh(a2, b2, c2, d3, x2, s3, t2) {
    return cmn(b2 ^ c2 ^ d3, a2, b2, x2, s3, t2);
  }
  function ii(a2, b2, c2, d3, x2, s3, t2) {
    return cmn(c2 ^ (b2 | ~d3), a2, b2, x2, s3, t2);
  }
  function isEmptyData3(data) {
    if (typeof data === "string") {
      return data.length === 0;
    }
    return data.byteLength === 0;
  }
  function convertToBuffer3(data) {
    if (typeof data === "string") {
      return fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
  }

  // node_modules/@smithy/util-body-length-browser/dist-es/calculateBodyLength.js
  var TEXT_ENCODER = typeof TextEncoder == "function" ? new TextEncoder() : null;
  var calculateBodyLength = (body) => {
    if (typeof body === "string") {
      if (TEXT_ENCODER) {
        return TEXT_ENCODER.encode(body).byteLength;
      }
      let len = body.length;
      for (let i2 = len - 1; i2 >= 0; i2--) {
        const code = body.charCodeAt(i2);
        if (code > 127 && code <= 2047)
          len++;
        else if (code > 2047 && code <= 65535)
          len += 2;
        if (code >= 56320 && code <= 57343)
          i2--;
      }
      return len;
    } else if (typeof body.byteLength === "number") {
      return body.byteLength;
    } else if (typeof body.size === "number") {
      return body.size;
    }
    throw new Error(`Body Length computation failed for ${body}`);
  };

  // node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.shared.js
  var getRuntimeConfig = (config2) => {
    return {
      apiVersion: "2006-03-01",
      base64Decoder: config2?.base64Decoder ?? fromBase64,
      base64Encoder: config2?.base64Encoder ?? toBase64,
      disableHostPrefix: config2?.disableHostPrefix ?? false,
      endpointProvider: config2?.endpointProvider ?? defaultEndpointResolver,
      extensions: config2?.extensions ?? [],
      getAwsChunkedEncodingStream: config2?.getAwsChunkedEncodingStream ?? getAwsChunkedEncodingStream,
      httpAuthSchemeProvider: config2?.httpAuthSchemeProvider ?? defaultS3HttpAuthSchemeProvider,
      httpAuthSchemes: config2?.httpAuthSchemes ?? [
        {
          schemeId: "aws.auth#sigv4",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4"),
          signer: new AwsSdkSigV4Signer()
        },
        {
          schemeId: "aws.auth#sigv4a",
          identityProvider: (ipc) => ipc.getIdentityProvider("aws.auth#sigv4a"),
          signer: new AwsSdkSigV4ASigner()
        }
      ],
      logger: config2?.logger ?? new NoOpLogger(),
      sdkStreamMixin: config2?.sdkStreamMixin ?? sdkStreamMixin,
      serviceId: config2?.serviceId ?? "S3",
      signerConstructor: config2?.signerConstructor ?? SignatureV4MultiRegion,
      signingEscapePath: config2?.signingEscapePath ?? false,
      urlParser: config2?.urlParser ?? parseUrl,
      useArnRegion: config2?.useArnRegion ?? false,
      utf8Decoder: config2?.utf8Decoder ?? fromUtf8,
      utf8Encoder: config2?.utf8Encoder ?? toUtf8
    };
  };

  // node_modules/@smithy/property-provider/dist-es/memoize.js
  var memoize = (provider, isExpired, requiresRefresh) => {
    let resolved;
    let pending;
    let hasResult;
    let isConstant = false;
    const coalesceProvider = async () => {
      if (!pending) {
        pending = provider();
      }
      try {
        resolved = await pending;
        hasResult = true;
        isConstant = false;
      } finally {
        pending = void 0;
      }
      return resolved;
    };
    if (isExpired === void 0) {
      return async (options) => {
        if (!hasResult || options?.forceRefresh) {
          resolved = await coalesceProvider();
        }
        return resolved;
      };
    }
    return async (options) => {
      if (!hasResult || options?.forceRefresh) {
        resolved = await coalesceProvider();
      }
      if (isConstant) {
        return resolved;
      }
      if (requiresRefresh && !requiresRefresh(resolved)) {
        isConstant = true;
        return resolved;
      }
      if (isExpired(resolved)) {
        await coalesceProvider();
        return resolved;
      }
      return resolved;
    };
  };

  // node_modules/@smithy/util-defaults-mode-browser/dist-es/resolveDefaultsModeConfig.js
  var import_bowser2 = __toESM(require_es5());

  // node_modules/@smithy/util-defaults-mode-browser/dist-es/constants.js
  var DEFAULTS_MODE_OPTIONS = ["in-region", "cross-region", "mobile", "standard", "legacy"];

  // node_modules/@smithy/util-defaults-mode-browser/dist-es/resolveDefaultsModeConfig.js
  var resolveDefaultsModeConfig = ({ defaultsMode } = {}) => memoize(async () => {
    const mode = typeof defaultsMode === "function" ? await defaultsMode() : defaultsMode;
    switch (mode?.toLowerCase()) {
      case "auto":
        return Promise.resolve(isMobileBrowser() ? "mobile" : "standard");
      case "mobile":
      case "in-region":
      case "cross-region":
      case "standard":
      case "legacy":
        return Promise.resolve(mode?.toLocaleLowerCase());
      case void 0:
        return Promise.resolve("legacy");
      default:
        throw new Error(`Invalid parameter for "defaultsMode", expect ${DEFAULTS_MODE_OPTIONS.join(", ")}, got ${mode}`);
    }
  });
  var isMobileBrowser = () => {
    const parsedUA = typeof window !== "undefined" && window?.navigator?.userAgent ? import_bowser2.default.parse(window.navigator.userAgent) : void 0;
    const platform2 = parsedUA?.platform?.type;
    return platform2 === "tablet" || platform2 === "mobile";
  };

  // node_modules/@aws-sdk/client-s3/dist-es/runtimeConfig.browser.js
  var getRuntimeConfig2 = (config2) => {
    const defaultsMode = resolveDefaultsModeConfig(config2);
    const defaultConfigProvider = () => defaultsMode().then(loadConfigsForDefaultMode);
    const clientSharedValues = getRuntimeConfig(config2);
    return {
      ...clientSharedValues,
      ...config2,
      runtime: "browser",
      defaultsMode,
      bodyLengthChecker: config2?.bodyLengthChecker ?? calculateBodyLength,
      credentialDefaultProvider: config2?.credentialDefaultProvider ?? ((_) => () => Promise.reject(new Error("Credential is missing"))),
      defaultUserAgentProvider: config2?.defaultUserAgentProvider ?? defaultUserAgent({ serviceId: clientSharedValues.serviceId, clientVersion: package_default.version }),
      eventStreamSerdeProvider: config2?.eventStreamSerdeProvider ?? eventStreamSerdeProvider,
      maxAttempts: config2?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      md5: config2?.md5 ?? Md5,
      region: config2?.region ?? invalidProvider("Region is missing"),
      requestHandler: FetchHttpHandler.create(config2?.requestHandler ?? defaultConfigProvider),
      retryMode: config2?.retryMode ?? (async () => (await defaultConfigProvider()).retryMode || DEFAULT_RETRY_MODE),
      sha1: config2?.sha1 ?? Sha12,
      sha256: config2?.sha256 ?? Sha2563,
      streamCollector: config2?.streamCollector ?? streamCollector,
      streamHasher: config2?.streamHasher ?? blobHasher,
      useDualstackEndpoint: config2?.useDualstackEndpoint ?? (() => Promise.resolve(DEFAULT_USE_DUALSTACK_ENDPOINT)),
      useFipsEndpoint: config2?.useFipsEndpoint ?? (() => Promise.resolve(DEFAULT_USE_FIPS_ENDPOINT))
    };
  };

  // node_modules/@aws-sdk/region-config-resolver/dist-es/extensions/index.js
  var getAwsRegionExtensionConfiguration = (runtimeConfig) => {
    let runtimeConfigRegion = async () => {
      if (runtimeConfig.region === void 0) {
        throw new Error("Region is missing from runtimeConfig");
      }
      const region = runtimeConfig.region;
      if (typeof region === "string") {
        return region;
      }
      return region();
    };
    return {
      setRegion(region) {
        runtimeConfigRegion = region;
      },
      region() {
        return runtimeConfigRegion;
      }
    };
  };
  var resolveAwsRegionExtensionConfiguration = (awsRegionExtensionConfiguration) => {
    return {
      region: awsRegionExtensionConfiguration.region()
    };
  };

  // node_modules/@aws-sdk/client-s3/dist-es/auth/httpAuthExtensionConfiguration.js
  var getHttpAuthExtensionConfiguration = (runtimeConfig) => {
    const _httpAuthSchemes = runtimeConfig.httpAuthSchemes;
    let _httpAuthSchemeProvider = runtimeConfig.httpAuthSchemeProvider;
    let _credentials = runtimeConfig.credentials;
    return {
      setHttpAuthScheme(httpAuthScheme) {
        const index = _httpAuthSchemes.findIndex((scheme) => scheme.schemeId === httpAuthScheme.schemeId);
        if (index === -1) {
          _httpAuthSchemes.push(httpAuthScheme);
        } else {
          _httpAuthSchemes.splice(index, 1, httpAuthScheme);
        }
      },
      httpAuthSchemes() {
        return _httpAuthSchemes;
      },
      setHttpAuthSchemeProvider(httpAuthSchemeProvider) {
        _httpAuthSchemeProvider = httpAuthSchemeProvider;
      },
      httpAuthSchemeProvider() {
        return _httpAuthSchemeProvider;
      },
      setCredentials(credentials) {
        _credentials = credentials;
      },
      credentials() {
        return _credentials;
      }
    };
  };
  var resolveHttpAuthRuntimeConfig = (config2) => {
    return {
      httpAuthSchemes: config2.httpAuthSchemes(),
      httpAuthSchemeProvider: config2.httpAuthSchemeProvider(),
      credentials: config2.credentials()
    };
  };

  // node_modules/@aws-sdk/client-s3/dist-es/runtimeExtensions.js
  var asPartial = (t2) => t2;
  var resolveRuntimeExtensions = (runtimeConfig, extensions2) => {
    const extensionConfiguration = {
      ...asPartial(getAwsRegionExtensionConfiguration(runtimeConfig)),
      ...asPartial(getDefaultExtensionConfiguration(runtimeConfig)),
      ...asPartial(getHttpHandlerExtensionConfiguration(runtimeConfig)),
      ...asPartial(getHttpAuthExtensionConfiguration(runtimeConfig))
    };
    extensions2.forEach((extension) => extension.configure(extensionConfiguration));
    return {
      ...runtimeConfig,
      ...resolveAwsRegionExtensionConfiguration(extensionConfiguration),
      ...resolveDefaultRuntimeConfig(extensionConfiguration),
      ...resolveHttpHandlerRuntimeConfig(extensionConfiguration),
      ...resolveHttpAuthRuntimeConfig(extensionConfiguration)
    };
  };

  // node_modules/@aws-sdk/client-s3/dist-es/S3Client.js
  var S3Client = class extends Client {
    constructor(...[configuration]) {
      const _config_0 = getRuntimeConfig2(configuration || {});
      const _config_1 = resolveClientEndpointParameters(_config_0);
      const _config_2 = resolveUserAgentConfig(_config_1);
      const _config_3 = resolveRetryConfig(_config_2);
      const _config_4 = resolveRegionConfig(_config_3);
      const _config_5 = resolveHostHeaderConfig(_config_4);
      const _config_6 = resolveEndpointConfig(_config_5);
      const _config_7 = resolveEventStreamSerdeConfig(_config_6);
      const _config_8 = resolveHttpAuthSchemeConfig(_config_7);
      const _config_9 = resolveS3Config(_config_8, { session: [() => this, CreateSessionCommand] });
      const _config_10 = resolveRuntimeExtensions(_config_9, configuration?.extensions || []);
      super(_config_10);
      this.config = _config_10;
      this.middlewareStack.use(getUserAgentPlugin(this.config));
      this.middlewareStack.use(getRetryPlugin(this.config));
      this.middlewareStack.use(getContentLengthPlugin(this.config));
      this.middlewareStack.use(getHostHeaderPlugin(this.config));
      this.middlewareStack.use(getLoggerPlugin(this.config));
      this.middlewareStack.use(getRecursionDetectionPlugin(this.config));
      this.middlewareStack.use(getHttpAuthSchemeEndpointRuleSetPlugin(this.config, {
        httpAuthSchemeParametersProvider: defaultS3HttpAuthSchemeParametersProvider,
        identityProviderConfigProvider: async (config2) => new DefaultIdentityProviderConfig({
          "aws.auth#sigv4": config2.credentials,
          "aws.auth#sigv4a": config2.credentials
        })
      }));
      this.middlewareStack.use(getHttpSigningPlugin(this.config));
      this.middlewareStack.use(getValidateBucketNamePlugin(this.config));
      this.middlewareStack.use(getAddExpectContinuePlugin(this.config));
      this.middlewareStack.use(getRegionRedirectMiddlewarePlugin(this.config));
      this.middlewareStack.use(getS3ExpressPlugin(this.config));
      this.middlewareStack.use(getS3ExpressHttpSigningPlugin(this.config));
    }
    destroy() {
      super.destroy();
    }
  };

  // node_modules/@aws-sdk/middleware-ssec/dist-es/index.js
  function ssecMiddleware(options) {
    return (next) => async (args) => {
      const input = { ...args.input };
      const properties = [
        {
          target: "SSECustomerKey",
          hash: "SSECustomerKeyMD5"
        },
        {
          target: "CopySourceSSECustomerKey",
          hash: "CopySourceSSECustomerKeyMD5"
        }
      ];
      for (const prop of properties) {
        const value = input[prop.target];
        if (value) {
          let valueForHash;
          if (typeof value === "string") {
            if (isValidBase64EncodedSSECustomerKey(value, options)) {
              valueForHash = options.base64Decoder(value);
            } else {
              valueForHash = options.utf8Decoder(value);
              input[prop.target] = options.base64Encoder(valueForHash);
            }
          } else {
            valueForHash = ArrayBuffer.isView(value) ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength) : new Uint8Array(value);
            input[prop.target] = options.base64Encoder(valueForHash);
          }
          const hash = new options.md5();
          hash.update(valueForHash);
          input[prop.hash] = options.base64Encoder(await hash.digest());
        }
      }
      return next({
        ...args,
        input
      });
    };
  }
  var ssecMiddlewareOptions = {
    name: "ssecMiddleware",
    step: "initialize",
    tags: ["SSE"],
    override: true
  };
  var getSsecPlugin = (config2) => ({
    applyToStack: (clientStack) => {
      clientStack.add(ssecMiddleware(config2), ssecMiddlewareOptions);
    }
  });
  function isValidBase64EncodedSSECustomerKey(str2, options) {
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (!base64Regex.test(str2))
      return false;
    try {
      const decodedBytes = options.base64Decoder(str2);
      return decodedBytes.length === 32;
    } catch {
      return false;
    }
  }

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/constants.js
  var ChecksumAlgorithm;
  (function(ChecksumAlgorithm2) {
    ChecksumAlgorithm2["MD5"] = "MD5";
    ChecksumAlgorithm2["CRC32"] = "CRC32";
    ChecksumAlgorithm2["CRC32C"] = "CRC32C";
    ChecksumAlgorithm2["SHA1"] = "SHA1";
    ChecksumAlgorithm2["SHA256"] = "SHA256";
  })(ChecksumAlgorithm || (ChecksumAlgorithm = {}));
  var ChecksumLocation;
  (function(ChecksumLocation2) {
    ChecksumLocation2["HEADER"] = "header";
    ChecksumLocation2["TRAILER"] = "trailer";
  })(ChecksumLocation || (ChecksumLocation = {}));
  var DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm.MD5;
  var S3_EXPRESS_DEFAULT_CHECKSUM_ALGORITHM = ChecksumAlgorithm.CRC32;

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/types.js
  var CLIENT_SUPPORTED_ALGORITHMS = [
    ChecksumAlgorithm.CRC32,
    ChecksumAlgorithm.CRC32C,
    ChecksumAlgorithm.SHA1,
    ChecksumAlgorithm.SHA256
  ];
  var PRIORITY_ORDER_ALGORITHMS = [
    ChecksumAlgorithm.CRC32,
    ChecksumAlgorithm.CRC32C,
    ChecksumAlgorithm.SHA1,
    ChecksumAlgorithm.SHA256
  ];

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmForRequest.js
  var getChecksumAlgorithmForRequest = (input, { requestChecksumRequired, requestAlgorithmMember }, isS3Express) => {
    const defaultAlgorithm = isS3Express ? S3_EXPRESS_DEFAULT_CHECKSUM_ALGORITHM : DEFAULT_CHECKSUM_ALGORITHM;
    if (!requestAlgorithmMember || !input[requestAlgorithmMember]) {
      return requestChecksumRequired ? defaultAlgorithm : void 0;
    }
    const checksumAlgorithm = input[requestAlgorithmMember];
    if (!CLIENT_SUPPORTED_ALGORITHMS.includes(checksumAlgorithm)) {
      throw new Error(`The checksum algorithm "${checksumAlgorithm}" is not supported by the client. Select one of ${CLIENT_SUPPORTED_ALGORITHMS}.`);
    }
    return checksumAlgorithm;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumLocationName.js
  var getChecksumLocationName = (algorithm) => algorithm === ChecksumAlgorithm.MD5 ? "content-md5" : `x-amz-checksum-${algorithm.toLowerCase()}`;

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/hasHeader.js
  var hasHeader2 = (header, headers) => {
    const soughtHeader = header.toLowerCase();
    for (const headerName of Object.keys(headers)) {
      if (soughtHeader === headerName.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isStreaming.js
  var isStreaming = (body) => body !== void 0 && typeof body !== "string" && !ArrayBuffer.isView(body) && !isArrayBuffer(body);

  // node_modules/@aws-crypto/crc32c/build/module/aws_crc32c.js
  var AwsCrc32c = (
    /** @class */
    function() {
      function AwsCrc32c2() {
        this.crc32c = new Crc32c();
      }
      AwsCrc32c2.prototype.update = function(toHash) {
        if (isEmptyData2(toHash))
          return;
        this.crc32c.update(convertToBuffer2(toHash));
      };
      AwsCrc32c2.prototype.digest = function() {
        return __awaiter(this, void 0, void 0, function() {
          return __generator(this, function(_a) {
            return [2, numToUint8(this.crc32c.digest())];
          });
        });
      };
      AwsCrc32c2.prototype.reset = function() {
        this.crc32c = new Crc32c();
      };
      return AwsCrc32c2;
    }()
  );

  // node_modules/@aws-crypto/crc32c/build/module/index.js
  var Crc32c = (
    /** @class */
    function() {
      function Crc32c2() {
        this.checksum = 4294967295;
      }
      Crc32c2.prototype.update = function(data) {
        var e_1, _a;
        try {
          for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var byte = data_1_1.value;
            this.checksum = this.checksum >>> 8 ^ lookupTable2[(this.checksum ^ byte) & 255];
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return))
              _a.call(data_1);
          } finally {
            if (e_1)
              throw e_1.error;
          }
        }
        return this;
      };
      Crc32c2.prototype.digest = function() {
        return (this.checksum ^ 4294967295) >>> 0;
      };
      return Crc32c2;
    }()
  );
  var a_lookupTable = [
    0,
    4067132163,
    3778769143,
    324072436,
    3348797215,
    904991772,
    648144872,
    3570033899,
    2329499855,
    2024987596,
    1809983544,
    2575936315,
    1296289744,
    3207089363,
    2893594407,
    1578318884,
    274646895,
    3795141740,
    4049975192,
    51262619,
    3619967088,
    632279923,
    922689671,
    3298075524,
    2592579488,
    1760304291,
    2075979607,
    2312596564,
    1562183871,
    2943781820,
    3156637768,
    1313733451,
    549293790,
    3537243613,
    3246849577,
    871202090,
    3878099393,
    357341890,
    102525238,
    4101499445,
    2858735121,
    1477399826,
    1264559846,
    3107202533,
    1845379342,
    2677391885,
    2361733625,
    2125378298,
    820201905,
    3263744690,
    3520608582,
    598981189,
    4151959214,
    85089709,
    373468761,
    3827903834,
    3124367742,
    1213305469,
    1526817161,
    2842354314,
    2107672161,
    2412447074,
    2627466902,
    1861252501,
    1098587580,
    3004210879,
    2688576843,
    1378610760,
    2262928035,
    1955203488,
    1742404180,
    2511436119,
    3416409459,
    969524848,
    714683780,
    3639785095,
    205050476,
    4266873199,
    3976438427,
    526918040,
    1361435347,
    2739821008,
    2954799652,
    1114974503,
    2529119692,
    1691668175,
    2005155131,
    2247081528,
    3690758684,
    697762079,
    986182379,
    3366744552,
    476452099,
    3993867776,
    4250756596,
    255256311,
    1640403810,
    2477592673,
    2164122517,
    1922457750,
    2791048317,
    1412925310,
    1197962378,
    3037525897,
    3944729517,
    427051182,
    170179418,
    4165941337,
    746937522,
    3740196785,
    3451792453,
    1070968646,
    1905808397,
    2213795598,
    2426610938,
    1657317369,
    3053634322,
    1147748369,
    1463399397,
    2773627110,
    4215344322,
    153784257,
    444234805,
    3893493558,
    1021025245,
    3467647198,
    3722505002,
    797665321,
    2197175160,
    1889384571,
    1674398607,
    2443626636,
    1164749927,
    3070701412,
    2757221520,
    1446797203,
    137323447,
    4198817972,
    3910406976,
    461344835,
    3484808360,
    1037989803,
    781091935,
    3705997148,
    2460548119,
    1623424788,
    1939049696,
    2180517859,
    1429367560,
    2807687179,
    3020495871,
    1180866812,
    410100952,
    3927582683,
    4182430767,
    186734380,
    3756733383,
    763408580,
    1053836080,
    3434856499,
    2722870694,
    1344288421,
    1131464017,
    2971354706,
    1708204729,
    2545590714,
    2229949006,
    1988219213,
    680717673,
    3673779818,
    3383336350,
    1002577565,
    4010310262,
    493091189,
    238226049,
    4233660802,
    2987750089,
    1082061258,
    1395524158,
    2705686845,
    1972364758,
    2279892693,
    2494862625,
    1725896226,
    952904198,
    3399985413,
    3656866545,
    731699698,
    4283874585,
    222117402,
    510512622,
    3959836397,
    3280807620,
    837199303,
    582374963,
    3504198960,
    68661723,
    4135334616,
    3844915500,
    390545967,
    1230274059,
    3141532936,
    2825850620,
    1510247935,
    2395924756,
    2091215383,
    1878366691,
    2644384480,
    3553878443,
    565732008,
    854102364,
    3229815391,
    340358836,
    3861050807,
    4117890627,
    119113024,
    1493875044,
    2875275879,
    3090270611,
    1247431312,
    2660249211,
    1828433272,
    2141937292,
    2378227087,
    3811616794,
    291187481,
    34330861,
    4032846830,
    615137029,
    3603020806,
    3314634738,
    939183345,
    1776939221,
    2609017814,
    2295496738,
    2058945313,
    2926798794,
    1545135305,
    1330124605,
    3173225534,
    4084100981,
    17165430,
    307568514,
    3762199681,
    888469610,
    3332340585,
    3587147933,
    665062302,
    2042050490,
    2346497209,
    2559330125,
    1793573966,
    3190661285,
    1279665062,
    1595330642,
    2910671697
  ];
  var lookupTable2 = uint32ArrayFrom(a_lookupTable);

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/selectChecksumAlgorithmFunction.js
  var selectChecksumAlgorithmFunction = (checksumAlgorithm, config2) => ({
    [ChecksumAlgorithm.MD5]: config2.md5,
    [ChecksumAlgorithm.CRC32]: AwsCrc32,
    [ChecksumAlgorithm.CRC32C]: AwsCrc32c,
    [ChecksumAlgorithm.SHA1]: config2.sha1,
    [ChecksumAlgorithm.SHA256]: config2.sha256
  })[checksumAlgorithm];

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/stringHasher.js
  var stringHasher = (checksumAlgorithmFn, body) => {
    const hash = new checksumAlgorithmFn();
    hash.update(toUint8Array(body || ""));
    return hash.digest();
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsMiddleware.js
  var flexibleChecksumsMiddlewareOptions = {
    name: "flexibleChecksumsMiddleware",
    step: "build",
    tags: ["BODY_CHECKSUM"],
    override: true
  };
  var flexibleChecksumsMiddleware = (config2, middlewareConfig) => (next, context) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) {
      return next(args);
    }
    const { request } = args;
    const { body: requestBody, headers } = request;
    const { base64Encoder, streamHasher } = config2;
    const { input, requestChecksumRequired, requestAlgorithmMember } = middlewareConfig;
    const checksumAlgorithm = getChecksumAlgorithmForRequest(input, {
      requestChecksumRequired,
      requestAlgorithmMember
    }, !!context.isS3ExpressBucket);
    let updatedBody = requestBody;
    let updatedHeaders = headers;
    if (checksumAlgorithm) {
      const checksumLocationName = getChecksumLocationName(checksumAlgorithm);
      const checksumAlgorithmFn = selectChecksumAlgorithmFunction(checksumAlgorithm, config2);
      if (isStreaming(requestBody)) {
        const { getAwsChunkedEncodingStream: getAwsChunkedEncodingStream2, bodyLengthChecker } = config2;
        updatedBody = getAwsChunkedEncodingStream2(requestBody, {
          base64Encoder,
          bodyLengthChecker,
          checksumLocationName,
          checksumAlgorithmFn,
          streamHasher
        });
        updatedHeaders = {
          ...headers,
          "content-encoding": headers["content-encoding"] ? `${headers["content-encoding"]},aws-chunked` : "aws-chunked",
          "transfer-encoding": "chunked",
          "x-amz-decoded-content-length": headers["content-length"],
          "x-amz-content-sha256": "STREAMING-UNSIGNED-PAYLOAD-TRAILER",
          "x-amz-trailer": checksumLocationName
        };
        delete updatedHeaders["content-length"];
      } else if (!hasHeader2(checksumLocationName, headers)) {
        const rawChecksum = await stringHasher(checksumAlgorithmFn, requestBody);
        updatedHeaders = {
          ...headers,
          [checksumLocationName]: base64Encoder(rawChecksum)
        };
      }
    }
    const result = await next({
      ...args,
      request: {
        ...request,
        headers: updatedHeaders,
        body: updatedBody
      }
    });
    return result;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksumAlgorithmListForResponse.js
  var getChecksumAlgorithmListForResponse = (responseAlgorithms = []) => {
    const validChecksumAlgorithms = [];
    for (const algorithm of PRIORITY_ORDER_ALGORITHMS) {
      if (!responseAlgorithms.includes(algorithm) || !CLIENT_SUPPORTED_ALGORITHMS.includes(algorithm)) {
        continue;
      }
      validChecksumAlgorithms.push(algorithm);
    }
    return validChecksumAlgorithms;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/isChecksumWithPartNumber.js
  var isChecksumWithPartNumber = (checksum) => {
    const lastHyphenIndex = checksum.lastIndexOf("-");
    if (lastHyphenIndex !== -1) {
      const numberPart = checksum.slice(lastHyphenIndex + 1);
      if (!numberPart.startsWith("0")) {
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number >= 1 && number <= 1e4) {
          return true;
        }
      }
    }
    return false;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/streams/create-read-stream-on-buffer.browser.js
  function createReadStreamOnBuffer(buffer) {
    return new Blob([buffer]).stream();
  }

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getChecksum.js
  var getChecksum = async (body, { streamHasher, checksumAlgorithmFn, base64Encoder }) => {
    const digest = isStreaming(body) ? streamHasher(checksumAlgorithmFn, body) : stringHasher(checksumAlgorithmFn, body);
    return base64Encoder(await digest);
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/validateChecksumFromResponse.js
  var validateChecksumFromResponse = async (response, { config: config2, responseAlgorithms }) => {
    const checksumAlgorithms = getChecksumAlgorithmListForResponse(responseAlgorithms);
    const { body: responseBody, headers: responseHeaders } = response;
    for (const algorithm of checksumAlgorithms) {
      const responseHeader = getChecksumLocationName(algorithm);
      const checksumFromResponse = responseHeaders[responseHeader];
      if (checksumFromResponse) {
        const checksumAlgorithmFn = selectChecksumAlgorithmFunction(algorithm, config2);
        const { streamHasher, base64Encoder } = config2;
        const checksum = await getChecksum(responseBody, { streamHasher, checksumAlgorithmFn, base64Encoder });
        if (checksum === checksumFromResponse) {
          break;
        }
        throw new Error(`Checksum mismatch: expected "${checksum}" but received "${checksumFromResponse}" in response header "${responseHeader}".`);
      }
    }
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/flexibleChecksumsResponseMiddleware.js
  var flexibleChecksumsResponseMiddlewareOptions = {
    name: "flexibleChecksumsResponseMiddleware",
    toMiddleware: "deserializerMiddleware",
    relation: "after",
    tags: ["BODY_CHECKSUM"],
    override: true
  };
  var flexibleChecksumsResponseMiddleware = (config2, middlewareConfig) => (next, context) => async (args) => {
    if (!HttpRequest.isInstance(args.request)) {
      return next(args);
    }
    const input = args.input;
    const result = await next(args);
    const response = result.response;
    let collectedStream = void 0;
    const { requestValidationModeMember, responseAlgorithms } = middlewareConfig;
    if (requestValidationModeMember && input[requestValidationModeMember] === "ENABLED") {
      const { clientName, commandName } = context;
      const isS3WholeObjectMultipartGetResponseChecksum = clientName === "S3Client" && commandName === "GetObjectCommand" && getChecksumAlgorithmListForResponse(responseAlgorithms).every((algorithm) => {
        const responseHeader = getChecksumLocationName(algorithm);
        const checksumFromResponse = response.headers[responseHeader];
        return !checksumFromResponse || isChecksumWithPartNumber(checksumFromResponse);
      });
      if (isS3WholeObjectMultipartGetResponseChecksum) {
        return result;
      }
      const isStreamingBody = isStreaming(response.body);
      if (isStreamingBody) {
        collectedStream = await config2.streamCollector(response.body);
        response.body = createReadStreamOnBuffer(collectedStream);
      }
      await validateChecksumFromResponse(result.response, {
        config: config2,
        responseAlgorithms
      });
      if (isStreamingBody && collectedStream) {
        response.body = createReadStreamOnBuffer(collectedStream);
      }
    }
    return result;
  };

  // node_modules/@aws-sdk/middleware-flexible-checksums/dist-es/getFlexibleChecksumsPlugin.js
  var getFlexibleChecksumsPlugin = (config2, middlewareConfig) => ({
    applyToStack: (clientStack) => {
      clientStack.add(flexibleChecksumsMiddleware(config2, middlewareConfig), flexibleChecksumsMiddlewareOptions);
      clientStack.addRelativeTo(flexibleChecksumsResponseMiddleware(config2, middlewareConfig), flexibleChecksumsResponseMiddlewareOptions);
    }
  });

  // node_modules/@aws-sdk/client-s3/dist-es/commands/HeadObjectCommand.js
  var HeadObjectCommand = class extends Command.classBuilder().ep({
    ...commonParams,
    Bucket: { type: "contextParams", name: "Bucket" },
    Key: { type: "contextParams", name: "Key" }
  }).m(function(Command2, cs2, config2, o2) {
    return [
      getSerdePlugin(config2, this.serialize, this.deserialize),
      getEndpointPlugin(config2, Command2.getEndpointParameterInstructions()),
      getThrow200ExceptionsPlugin(config2),
      getSsecPlugin(config2),
      getS3ExpiresMiddlewarePlugin(config2)
    ];
  }).s("AmazonS3", "HeadObject", {}).n("S3Client", "HeadObjectCommand").f(HeadObjectRequestFilterSensitiveLog, HeadObjectOutputFilterSensitiveLog).ser(se_HeadObjectCommand).de(de_HeadObjectCommand).build() {
  };

  // node_modules/@aws-sdk/client-s3/dist-es/commands/PutObjectCommand.js
  var PutObjectCommand = class extends Command.classBuilder().ep({
    ...commonParams,
    Bucket: { type: "contextParams", name: "Bucket" },
    Key: { type: "contextParams", name: "Key" }
  }).m(function(Command2, cs2, config2, o2) {
    return [
      getSerdePlugin(config2, this.serialize, this.deserialize),
      getEndpointPlugin(config2, Command2.getEndpointParameterInstructions()),
      getFlexibleChecksumsPlugin(config2, {
        input: this.input,
        requestAlgorithmMember: "ChecksumAlgorithm",
        requestChecksumRequired: false
      }),
      getCheckContentLengthHeaderPlugin(config2),
      getThrow200ExceptionsPlugin(config2),
      getSsecPlugin(config2)
    ];
  }).s("AmazonS3", "PutObject", {}).n("S3Client", "PutObjectCommand").f(PutObjectRequestFilterSensitiveLog, PutObjectOutputFilterSensitiveLog).ser(se_PutObjectCommand).de(de_PutObjectCommand).build() {
  };

  // src/utils.ts
  var genDateDirName = () => {
    const date = /* @__PURE__ */ new Date();
    const t2 = (val2) => {
      if (val2 < 10) {
        return `0${val2}`;
      }
      return String(val2);
    };
    return `${date.getUTCFullYear()}${t2(date.getUTCMonth() + 1)}${t2(date.getUTCDate())}`;
  };
  var isOwner = (username) => {
    return username === self.TG_BOT_OWNER_USERNAME;
  };
  var isInPrivateChat = (message) => {
    const chatType = message.chat.type;
    return chatType === "private";
  };

  // src/oss/backblazeB2.ts
  var BackblazeB2 = class {
    client;
    constructor() {
      this.client = new S3Client({
        endpoint: `https://${self.B2_ENDPOINT}`,
        region: self.B2_ENDPOINT.split(".")[1],
        credentials: {
          accessKeyId: self.B2_KEY_ID || "",
          secretAccessKey: self.B2_SECRET_KEY || ""
        }
      });
    }
    async uploadImage(data, fileName, fileType, customPath) {
      const filePath = customPath || `${genDateDirName()}/${fileName}.${fileType}`;
      await this.client.send(new PutObjectCommand({
        Bucket: self.B2_BUCKET,
        Key: filePath,
        Body: data,
        ContentType: `image/${fileType}`
      }));
      return filePath;
    }
    async checkFileExists(filePath) {
      try {
        await this.client.send(new HeadObjectCommand({
          Bucket: self.B2_BUCKET,
          Key: filePath
        }));
        return true;
      } catch (error) {
        return false;
      }
    }
    getURL(filePath) {
      if (self.B2_CUSTOM_DOMAIN) {
        return `https://${self.B2_CUSTOM_DOMAIN}/${filePath}`;
      }
      return `https://${self.B2_BUCKET}.${self.B2_ENDPOINT}/${filePath}`;
    }
  };
  var backblazeB2_default = BackblazeB2;

  // src/oss/cloudflareR2.ts
  var CloudflareR2 = class {
    async uploadImage(data, fileName, fileType, customPath) {
      const filePath = customPath || `${genDateDirName()}/${fileName}.${fileType}`;
      await self.R2_IMG_MOM.put(filePath, data);
      return filePath;
    }
    async checkFileExists(filePath) {
      const obj = await self.R2_IMG_MOM.head(filePath);
      return obj !== null;
    }
    getURL(filePath) {
      if (self.R2_CUSTOM_DOMAIN) {
        return `https://${self.R2_CUSTOM_DOMAIN}/${filePath}`;
      }
      return filePath;
    }
  };
  var cloudflareR2_default = CloudflareR2;

  // src/bot.ts
  var supportProviders = {
    BackblazeB2: backblazeB2_default,
    CloudflareR2: cloudflareR2_default
  };
  var bot = new Bot(self.TG_BOT_TOKEN);
  bot.use((ctx, next) => {
    console.log(JSON.stringify(ctx.update, null, 2));
    return next();
  });
  bot.command("start", (ctx) => ctx.reply("Welcome to use ImgMom"));
  bot.command("help", async (ctx) => {
    const commands = await ctx.api.getMyCommands();
    const info = commands.reduce((acc, val2) => `${acc}/${val2.command} - ${val2.description}
`, "");
    return ctx.reply(info);
  });
  bot.use(async (ctx, next) => {
    if (["true", true].includes(self.TG_BOT_ALLOW_ANYONE)) {
      if (ctx.message?.photo || ctx.message?.document) {
        return next();
      }
    }
    const userName = ctx.from?.username;
    if (!isOwner(userName)) {
      return ctx.reply("You don't have the relevant permissions, the img-mom bot code is open source and you can self-deploy it. \nVisit: https://github.com/beilunyang/img-mom");
    }
    await next();
  });
  bot.command("settings", async (ctx) => {
    const buttons = [
      ...Object.keys(supportProviders).map((provider) => InlineKeyboard.text(provider, provider)),
      InlineKeyboard.text("None", "None")
    ];
    const keyboard = InlineKeyboard.from([buttons]);
    return ctx.reply("Setting up additional OSS provider", {
      reply_markup: keyboard
    });
  });
  bot.on("callback_query:data", async (ctx) => {
    const data = ctx.callbackQuery.data;
    switch (data) {
      case "confirm_overwrite": {
        const key = `pending_upload_${ctx.callbackQuery.from.username}`;
        const pendingUpload = await self.KV_IMG_MOM.get(key);
        if (!pendingUpload) {
          return ctx.reply("No pending upload found.");
        }
        const { providerName, filePath, fileName, fileType, customPath, tgImgUrl } = JSON.parse(pendingUpload);
        const providerClass = supportProviders[providerName];
        if (!providerClass) {
          return ctx.reply("Invalid provider.");
        }
        const provider = new providerClass();
        try {
          const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${filePath}`);
          if (!res.ok) {
            return ctx.reply("Failed to fetch file from Telegram");
          }
          const fileData = await res.arrayBuffer();
          const uploadedPath = await provider.uploadImage(fileData, fileName, fileType, customPath);
          const fullUrl = provider.getURL(uploadedPath);
          await self.KV_IMG_MOM.delete(key);
          return ctx.reply(
            `Successfully uploaded image with overwrite!
Telegram:
${tgImgUrl}
${providerName}:
${fullUrl}`
          );
        } catch (err) {
          console.error(err);
          return ctx.reply("Failed to upload file: " + err.message);
        }
        break;
      }
      case "cancel_overwrite": {
        const key = `pending_upload_${ctx.callbackQuery.from.username}`;
        await self.KV_IMG_MOM.delete(key);
        return ctx.reply("Upload cancelled.");
      }
      default: {
        const provider = data;
        const key = `oss_provider_${ctx.callbackQuery.from.username}`;
        if (provider === "None") {
          self.KV_IMG_MOM.delete(key);
        } else {
          self.KV_IMG_MOM.put(key, provider);
        }
        return ctx.reply(`Ok. Successfully set oss provider (${provider})`);
      }
    }
  });
  bot.on(["message:photo", "message:document"], async (ctx) => {
    if (!isInPrivateChat(ctx.message)) {
      console.log("Can only be used in private chat");
      return;
    }
    const file = await ctx.getFile();
    const caption = ctx.message.caption?.startsWith("/") ? ctx.message.caption.slice(1) : ctx.message.caption;
    const tgImgUrl = `https://${self.host}/img/${file.file_id}`;
    if (!isOwner(ctx.message.from.username)) {
      return ctx.reply(
        `Successfully uploaded image!
Telegram:
${tgImgUrl}`
      );
    }
    let provider;
    const providerName = await self.KV_IMG_MOM.get(`oss_provider_${ctx.message.from.username}`) ?? "";
    const providerClass = supportProviders[providerName];
    if (providerClass) {
      provider = new providerClass();
    }
    if (!provider) {
      return ctx.reply(
        `Successfully uploaded image!
Telegram:
${tgImgUrl}`
      );
    }
    const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${file.file_path}`);
    if (!res.ok) {
      return ctx.reply("Failed to upload file");
    }
    const fileType = file.file_path?.split(".").pop() || "";
    const fileData = await res.arrayBuffer();
    try {
      if (caption) {
        const exists = await provider.checkFileExists(caption);
        if (exists) {
          const pendingUpload = {
            providerName,
            filePath: file.file_path,
            fileName: file.file_unique_id,
            fileType,
            customPath: caption,
            tgImgUrl
          };
          await self.KV_IMG_MOM.put(
            `pending_upload_${ctx.message.from.username}`,
            JSON.stringify(pendingUpload),
            { expirationTtl: 300 }
          );
          const keyboard = InlineKeyboard.from([
            [
              InlineKeyboard.text("Yes", "confirm_overwrite"),
              InlineKeyboard.text("No", "cancel_overwrite")
            ]
          ]);
          return ctx.reply(
            `File already exists at path "${caption}". Do you want to overwrite it?`,
            { reply_markup: keyboard }
          );
        }
        const filePath = await provider.uploadImage(fileData, file.file_unique_id, fileType, caption);
        const fullUrl = provider.getURL(filePath);
        return ctx.reply(
          `Successfully uploaded image!
Telegram:
${tgImgUrl}
${providerName}:
${fullUrl}`
        );
      } else {
        const filePath = await provider.uploadImage(fileData, file.file_unique_id, fileType);
        const fullUrl = provider.getURL(filePath);
        return ctx.reply(
          `Successfully uploaded image!
Telegram:
${tgImgUrl}
${providerName}:
${fullUrl}`
        );
      }
    } catch (err) {
      console.error(err);
      return ctx.reply("Failed to upload file: " + err.message);
    }
  });
  var bot_default = bot;

  // node_modules/token-types/lib/index.js
  var ieee754 = __toESM(require_ieee754(), 1);
  function dv(array) {
    return new DataView(array.buffer, array.byteOffset);
  }
  var UINT8 = {
    len: 1,
    get(array, offset) {
      return dv(array).getUint8(offset);
    },
    put(array, offset, value) {
      dv(array).setUint8(offset, value);
      return offset + 1;
    }
  };
  var UINT16_LE = {
    len: 2,
    get(array, offset) {
      return dv(array).getUint16(offset, true);
    },
    put(array, offset, value) {
      dv(array).setUint16(offset, value, true);
      return offset + 2;
    }
  };
  var UINT16_BE = {
    len: 2,
    get(array, offset) {
      return dv(array).getUint16(offset);
    },
    put(array, offset, value) {
      dv(array).setUint16(offset, value);
      return offset + 2;
    }
  };
  var UINT32_LE = {
    len: 4,
    get(array, offset) {
      return dv(array).getUint32(offset, true);
    },
    put(array, offset, value) {
      dv(array).setUint32(offset, value, true);
      return offset + 4;
    }
  };
  var UINT32_BE = {
    len: 4,
    get(array, offset) {
      return dv(array).getUint32(offset);
    },
    put(array, offset, value) {
      dv(array).setUint32(offset, value);
      return offset + 4;
    }
  };
  var INT32_BE = {
    len: 4,
    get(array, offset) {
      return dv(array).getInt32(offset);
    },
    put(array, offset, value) {
      dv(array).setInt32(offset, value);
      return offset + 4;
    }
  };
  var UINT64_LE = {
    len: 8,
    get(array, offset) {
      return dv(array).getBigUint64(offset, true);
    },
    put(array, offset, value) {
      dv(array).setBigUint64(offset, value, true);
      return offset + 8;
    }
  };
  var StringType = class {
    constructor(len, encoding) {
      this.len = len;
      this.encoding = encoding;
      this.textDecoder = new TextDecoder(encoding);
    }
    get(uint8Array, offset) {
      return this.textDecoder.decode(uint8Array.subarray(offset, offset + this.len));
    }
  };

  // node_modules/peek-readable/lib/EndOfStreamError.js
  var defaultMessages = "End-Of-Stream";
  var EndOfStreamError = class extends Error {
    constructor() {
      super(defaultMessages);
    }
  };

  // node_modules/peek-readable/lib/AbstractStreamReader.js
  var AbstractStreamReader = class {
    constructor() {
      this.maxStreamReadSize = 1 * 1024 * 1024;
      this.endOfStream = false;
      this.peekQueue = [];
    }
    async peek(uint8Array, offset, length) {
      const bytesRead = await this.read(uint8Array, offset, length);
      this.peekQueue.push(uint8Array.subarray(offset, offset + bytesRead));
      return bytesRead;
    }
    async read(buffer, offset, length) {
      if (length === 0) {
        return 0;
      }
      let bytesRead = this.readFromPeekBuffer(buffer, offset, length);
      bytesRead += await this.readRemainderFromStream(buffer, offset + bytesRead, length - bytesRead);
      if (bytesRead === 0) {
        throw new EndOfStreamError();
      }
      return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
     * @param offset - Offset target
     * @param length - Number of bytes to read
     * @returns Number of bytes read
     */
    readFromPeekBuffer(buffer, offset, length) {
      let remaining = length;
      let bytesRead = 0;
      while (this.peekQueue.length > 0 && remaining > 0) {
        const peekData = this.peekQueue.pop();
        if (!peekData)
          throw new Error("peekData should be defined");
        const lenCopy = Math.min(peekData.length, remaining);
        buffer.set(peekData.subarray(0, lenCopy), offset + bytesRead);
        bytesRead += lenCopy;
        remaining -= lenCopy;
        if (lenCopy < peekData.length) {
          this.peekQueue.push(peekData.subarray(lenCopy));
        }
      }
      return bytesRead;
    }
    async readRemainderFromStream(buffer, offset, initialRemaining) {
      let remaining = initialRemaining;
      let bytesRead = 0;
      while (remaining > 0 && !this.endOfStream) {
        const reqLen = Math.min(remaining, this.maxStreamReadSize);
        const chunkLen = await this.readFromStream(buffer, offset + bytesRead, reqLen);
        if (chunkLen === 0)
          break;
        bytesRead += chunkLen;
        remaining -= chunkLen;
      }
      return bytesRead;
    }
  };

  // node_modules/peek-readable/lib/WebStreamReader.js
  var WebStreamReader = class extends AbstractStreamReader {
    constructor(stream) {
      super();
      this.abortController = new AbortController();
      this.reader = stream.getReader({ mode: "byob" });
    }
    async readFromStream(buffer, offset, length) {
      if (this.endOfStream) {
        throw new EndOfStreamError();
      }
      const result = await this.reader.read(new Uint8Array(length));
      if (result.done) {
        this.endOfStream = result.done;
      }
      if (result.value) {
        buffer.set(result.value, offset);
        return result.value.byteLength;
      }
      return 0;
    }
    abort() {
      return this.reader.cancel();
    }
  };

  // node_modules/strtok3/lib/AbstractTokenizer.js
  var AbstractTokenizer = class {
    /**
     * Constructor
     * @param options Tokenizer options
     * @protected
     */
    constructor(options) {
      this.position = 0;
      this.numBuffer = new Uint8Array(8);
      this.fileInfo = options?.fileInfo ?? {};
      this.onClose = options?.onClose;
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @returns Promise with token data
     */
    async readToken(token, position = this.position) {
      const uint8Array = new Uint8Array(token.len);
      const len = await this.readBuffer(uint8Array, { position });
      if (len < token.len)
        throw new EndOfStreamError();
      return token.get(uint8Array, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position) {
      const uint8Array = new Uint8Array(token.len);
      const len = await this.peekBuffer(uint8Array, { position });
      if (len < token.len)
        throw new EndOfStreamError();
      return token.get(uint8Array, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
      const len = await this.readBuffer(this.numBuffer, { length: token.len });
      if (len < token.len)
        throw new EndOfStreamError();
      return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
      const len = await this.peekBuffer(this.numBuffer, { length: token.len });
      if (len < token.len)
        throw new EndOfStreamError();
      return token.get(this.numBuffer, 0);
    }
    /**
     * Ignore number of bytes, advances the pointer in under tokenizer-stream.
     * @param length - Number of bytes to ignore
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
      if (this.fileInfo.size !== void 0) {
        const bytesLeft = this.fileInfo.size - this.position;
        if (length > bytesLeft) {
          this.position += bytesLeft;
          return bytesLeft;
        }
      }
      this.position += length;
      return length;
    }
    async close() {
      await this.onClose?.();
    }
    normalizeOptions(uint8Array, options) {
      if (options && options.position !== void 0 && options.position < this.position) {
        throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
      }
      if (options) {
        return {
          mayBeLess: options.mayBeLess === true,
          offset: options.offset ? options.offset : 0,
          length: options.length ? options.length : uint8Array.length - (options.offset ? options.offset : 0),
          position: options.position ? options.position : this.position
        };
      }
      return {
        mayBeLess: false,
        offset: 0,
        length: uint8Array.length,
        position: this.position
      };
    }
  };

  // node_modules/strtok3/lib/ReadStreamTokenizer.js
  var maxBufferSize = 256e3;
  var ReadStreamTokenizer = class extends AbstractTokenizer {
    /**
     * Constructor
     * @param streamReader stream-reader to read from
     * @param options Tokenizer options
     */
    constructor(streamReader, options) {
      super(options);
      this.streamReader = streamReader;
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    async readBuffer(uint8Array, options) {
      const normOptions = this.normalizeOptions(uint8Array, options);
      const skipBytes = normOptions.position - this.position;
      if (skipBytes > 0) {
        await this.ignore(skipBytes);
        return this.readBuffer(uint8Array, options);
      }
      if (skipBytes < 0) {
        throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
      }
      if (normOptions.length === 0) {
        return 0;
      }
      const bytesRead = await this.streamReader.read(uint8Array, normOptions.offset, normOptions.length);
      this.position += bytesRead;
      if ((!options || !options.mayBeLess) && bytesRead < normOptions.length) {
        throw new EndOfStreamError();
      }
      return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array - Uint8Array (or Buffer) to write data to
     * @param options - Read behaviour options
     * @returns Promise with number of bytes peeked
     */
    async peekBuffer(uint8Array, options) {
      const normOptions = this.normalizeOptions(uint8Array, options);
      let bytesRead = 0;
      if (normOptions.position) {
        const skipBytes = normOptions.position - this.position;
        if (skipBytes > 0) {
          const skipBuffer = new Uint8Array(normOptions.length + skipBytes);
          bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: normOptions.mayBeLess });
          uint8Array.set(skipBuffer.subarray(skipBytes), normOptions.offset);
          return bytesRead - skipBytes;
        }
        if (skipBytes < 0) {
          throw new Error("Cannot peek from a negative offset in a stream");
        }
      }
      if (normOptions.length > 0) {
        try {
          bytesRead = await this.streamReader.peek(uint8Array, normOptions.offset, normOptions.length);
        } catch (err) {
          if (options?.mayBeLess && err instanceof EndOfStreamError) {
            return 0;
          }
          throw err;
        }
        if (!normOptions.mayBeLess && bytesRead < normOptions.length) {
          throw new EndOfStreamError();
        }
      }
      return bytesRead;
    }
    async ignore(length) {
      const bufSize = Math.min(maxBufferSize, length);
      const buf = new Uint8Array(bufSize);
      let totBytesRead = 0;
      while (totBytesRead < length) {
        const remaining = length - totBytesRead;
        const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
        if (bytesRead < 0) {
          return bytesRead;
        }
        totBytesRead += bytesRead;
      }
      return totBytesRead;
    }
  };

  // node_modules/strtok3/lib/BufferTokenizer.js
  var BufferTokenizer = class extends AbstractTokenizer {
    /**
     * Construct BufferTokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options Tokenizer options
     */
    constructor(uint8Array, options) {
      super(options);
      this.uint8Array = uint8Array;
      this.fileInfo.size = this.fileInfo.size ? this.fileInfo.size : uint8Array.length;
    }
    /**
     * Read buffer from tokenizer
     * @param uint8Array - Uint8Array to tokenize
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(uint8Array, options) {
      if (options?.position) {
        if (options.position < this.position) {
          throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
        }
        this.position = options.position;
      }
      const bytesRead = await this.peekBuffer(uint8Array, options);
      this.position += bytesRead;
      return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param uint8Array
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(uint8Array, options) {
      const normOptions = this.normalizeOptions(uint8Array, options);
      const bytes2read = Math.min(this.uint8Array.length - normOptions.position, normOptions.length);
      if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
        throw new EndOfStreamError();
      }
      uint8Array.set(this.uint8Array.subarray(normOptions.position, normOptions.position + bytes2read), normOptions.offset);
      return bytes2read;
    }
    close() {
      return super.close();
    }
  };

  // node_modules/strtok3/lib/core.js
  function fromWebStream(webStream, options) {
    return new ReadStreamTokenizer(new WebStreamReader(webStream), options);
  }
  function fromBuffer(uint8Array, options) {
    return new BufferTokenizer(uint8Array, options);
  }

  // node_modules/uint8array-extras/index.js
  var cachedDecoders = {
    utf8: new globalThis.TextDecoder("utf8")
  };
  var cachedEncoder = new globalThis.TextEncoder();
  var byteToHexLookupTable = Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
  function getUintBE(view) {
    const { byteLength } = view;
    if (byteLength === 6) {
      return view.getUint16(0) * 2 ** 32 + view.getUint32(2);
    }
    if (byteLength === 5) {
      return view.getUint8(0) * 2 ** 32 + view.getUint32(1);
    }
    if (byteLength === 4) {
      return view.getUint32(0);
    }
    if (byteLength === 3) {
      return view.getUint8(0) * 2 ** 16 + view.getUint16(1);
    }
    if (byteLength === 2) {
      return view.getUint16(0);
    }
    if (byteLength === 1) {
      return view.getUint8(0);
    }
  }
  function indexOf(array, value) {
    const arrayLength = array.length;
    const valueLength = value.length;
    if (valueLength === 0) {
      return -1;
    }
    if (valueLength > arrayLength) {
      return -1;
    }
    const validOffsetLength = arrayLength - valueLength;
    for (let index = 0; index <= validOffsetLength; index++) {
      let isMatch = true;
      for (let index2 = 0; index2 < valueLength; index2++) {
        if (array[index + index2] !== value[index2]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        return index;
      }
    }
    return -1;
  }
  function includes(array, value) {
    return indexOf(array, value) !== -1;
  }

  // node_modules/file-type/util.js
  function stringToBytes(string) {
    return [...string].map((character) => character.charCodeAt(0));
  }
  function tarHeaderChecksumMatches(arrayBuffer, offset = 0) {
    const readSum = Number.parseInt(new StringType(6).get(arrayBuffer, 148).replace(/\0.*$/, "").trim(), 8);
    if (Number.isNaN(readSum)) {
      return false;
    }
    let sum = 8 * 32;
    for (let index = offset; index < offset + 148; index++) {
      sum += arrayBuffer[index];
    }
    for (let index = offset + 156; index < offset + 512; index++) {
      sum += arrayBuffer[index];
    }
    return readSum === sum;
  }
  var uint32SyncSafeToken = {
    get: (buffer, offset) => buffer[offset + 3] & 127 | buffer[offset + 2] << 7 | buffer[offset + 1] << 14 | buffer[offset] << 21,
    len: 4
  };

  // node_modules/file-type/supported.js
  var extensions = [
    "jpg",
    "png",
    "apng",
    "gif",
    "webp",
    "flif",
    "xcf",
    "cr2",
    "cr3",
    "orf",
    "arw",
    "dng",
    "nef",
    "rw2",
    "raf",
    "tif",
    "bmp",
    "icns",
    "jxr",
    "psd",
    "indd",
    "zip",
    "tar",
    "rar",
    "gz",
    "bz2",
    "7z",
    "dmg",
    "mp4",
    "mid",
    "mkv",
    "webm",
    "mov",
    "avi",
    "mpg",
    "mp2",
    "mp3",
    "m4a",
    "oga",
    "ogg",
    "ogv",
    "opus",
    "flac",
    "wav",
    "spx",
    "amr",
    "pdf",
    "epub",
    "elf",
    "macho",
    "exe",
    "swf",
    "rtf",
    "wasm",
    "woff",
    "woff2",
    "eot",
    "ttf",
    "otf",
    "ico",
    "flv",
    "ps",
    "xz",
    "sqlite",
    "nes",
    "crx",
    "xpi",
    "cab",
    "deb",
    "ar",
    "rpm",
    "Z",
    "lz",
    "cfb",
    "mxf",
    "mts",
    "blend",
    "bpg",
    "docx",
    "pptx",
    "xlsx",
    "3gp",
    "3g2",
    "j2c",
    "jp2",
    "jpm",
    "jpx",
    "mj2",
    "aif",
    "qcp",
    "odt",
    "ods",
    "odp",
    "xml",
    "mobi",
    "heic",
    "cur",
    "ktx",
    "ape",
    "wv",
    "dcm",
    "ics",
    "glb",
    "pcap",
    "dsf",
    "lnk",
    "alias",
    "voc",
    "ac3",
    "m4v",
    "m4p",
    "m4b",
    "f4v",
    "f4p",
    "f4b",
    "f4a",
    "mie",
    "asf",
    "ogm",
    "ogx",
    "mpc",
    "arrow",
    "shp",
    "aac",
    "mp1",
    "it",
    "s3m",
    "xm",
    "ai",
    "skp",
    "avif",
    "eps",
    "lzh",
    "pgp",
    "asar",
    "stl",
    "chm",
    "3mf",
    "zst",
    "jxl",
    "vcf",
    "jls",
    "pst",
    "dwg",
    "parquet",
    "class",
    "arj",
    "cpio",
    "ace",
    "avro",
    "icc",
    "fbx",
    "vsdx",
    "vtt"
  ];
  var mimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/flif",
    "image/x-xcf",
    "image/x-canon-cr2",
    "image/x-canon-cr3",
    "image/tiff",
    "image/bmp",
    "image/vnd.ms-photo",
    "image/vnd.adobe.photoshop",
    "application/x-indesign",
    "application/epub+zip",
    "application/x-xpinstall",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "application/vnd.oasis.opendocument.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-tar",
    "application/x-rar-compressed",
    "application/gzip",
    "application/x-bzip2",
    "application/x-7z-compressed",
    "application/x-apple-diskimage",
    "application/x-apache-arrow",
    "video/mp4",
    "audio/midi",
    "video/x-matroska",
    "video/webm",
    "video/quicktime",
    "video/vnd.avi",
    "audio/wav",
    "audio/qcelp",
    "audio/x-ms-asf",
    "video/x-ms-asf",
    "application/vnd.ms-asf",
    "video/mpeg",
    "video/3gpp",
    "audio/mpeg",
    "audio/mp4",
    // RFC 4337
    "audio/opus",
    "video/ogg",
    "audio/ogg",
    "application/ogg",
    "audio/x-flac",
    "audio/ape",
    "audio/wavpack",
    "audio/amr",
    "application/pdf",
    "application/x-elf",
    "application/x-mach-binary",
    "application/x-msdownload",
    "application/x-shockwave-flash",
    "application/rtf",
    "application/wasm",
    "font/woff",
    "font/woff2",
    "application/vnd.ms-fontobject",
    "font/ttf",
    "font/otf",
    "image/x-icon",
    "video/x-flv",
    "application/postscript",
    "application/eps",
    "application/x-xz",
    "application/x-sqlite3",
    "application/x-nintendo-nes-rom",
    "application/x-google-chrome-extension",
    "application/vnd.ms-cab-compressed",
    "application/x-deb",
    "application/x-unix-archive",
    "application/x-rpm",
    "application/x-compress",
    "application/x-lzip",
    "application/x-cfb",
    "application/x-mie",
    "application/mxf",
    "video/mp2t",
    "application/x-blender",
    "image/bpg",
    "image/j2c",
    "image/jp2",
    "image/jpx",
    "image/jpm",
    "image/mj2",
    "audio/aiff",
    "application/xml",
    "application/x-mobipocket-ebook",
    "image/heif",
    "image/heif-sequence",
    "image/heic",
    "image/heic-sequence",
    "image/icns",
    "image/ktx",
    "application/dicom",
    "audio/x-musepack",
    "text/calendar",
    "text/vcard",
    "text/vtt",
    "model/gltf-binary",
    "application/vnd.tcpdump.pcap",
    "audio/x-dsf",
    // Non-standard
    "application/x.ms.shortcut",
    // Invented by us
    "application/x.apple.alias",
    // Invented by us
    "audio/x-voc",
    "audio/vnd.dolby.dd-raw",
    "audio/x-m4a",
    "image/apng",
    "image/x-olympus-orf",
    "image/x-sony-arw",
    "image/x-adobe-dng",
    "image/x-nikon-nef",
    "image/x-panasonic-rw2",
    "image/x-fujifilm-raf",
    "video/x-m4v",
    "video/3gpp2",
    "application/x-esri-shape",
    "audio/aac",
    "audio/x-it",
    "audio/x-s3m",
    "audio/x-xm",
    "video/MP1S",
    "video/MP2P",
    "application/vnd.sketchup.skp",
    "image/avif",
    "application/x-lzh-compressed",
    "application/pgp-encrypted",
    "application/x-asar",
    "model/stl",
    "application/vnd.ms-htmlhelp",
    "model/3mf",
    "image/jxl",
    "application/zstd",
    "image/jls",
    "application/vnd.ms-outlook",
    "image/vnd.dwg",
    "application/x-parquet",
    "application/java-vm",
    "application/x-arj",
    "application/x-cpio",
    "application/x-ace-compressed",
    "application/avro",
    "application/vnd.iccprofile",
    "application/x.autodesk.fbx",
    // Invented by us
    "application/vnd.visio"
  ];

  // node_modules/file-type/core.js
  var reasonableDetectionSizeInBytes = 4100;
  async function fileTypeFromBuffer(input) {
    return new FileTypeParser().fromBuffer(input);
  }
  function _check(buffer, headers, options) {
    options = {
      offset: 0,
      ...options
    };
    for (const [index, header] of headers.entries()) {
      if (options.mask) {
        if (header !== (options.mask[index] & buffer[index + options.offset])) {
          return false;
        }
      } else if (header !== buffer[index + options.offset]) {
        return false;
      }
    }
    return true;
  }
  var FileTypeParser = class {
    constructor(options) {
      this.detectors = options?.customDetectors;
      this.fromTokenizer = this.fromTokenizer.bind(this);
      this.fromBuffer = this.fromBuffer.bind(this);
      this.parse = this.parse.bind(this);
    }
    async fromTokenizer(tokenizer) {
      const initialPosition = tokenizer.position;
      for (const detector of this.detectors || []) {
        const fileType = await detector(tokenizer);
        if (fileType) {
          return fileType;
        }
        if (initialPosition !== tokenizer.position) {
          return void 0;
        }
      }
      return this.parse(tokenizer);
    }
    async fromBuffer(input) {
      if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
        throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof input}\``);
      }
      const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
      if (!(buffer?.length > 1)) {
        return;
      }
      return this.fromTokenizer(fromBuffer(buffer));
    }
    async fromBlob(blob) {
      return this.fromStream(blob.stream());
    }
    async fromStream(stream) {
      const tokenizer = await fromWebStream(stream);
      try {
        return await this.fromTokenizer(tokenizer);
      } finally {
        await tokenizer.close();
      }
    }
    async toDetectionStream(stream, options) {
      const { sampleSize = reasonableDetectionSizeInBytes } = options;
      let detectedFileType;
      let firstChunk;
      const reader = stream.getReader({ mode: "byob" });
      try {
        const { value: chunk, done } = await reader.read(new Uint8Array(sampleSize));
        firstChunk = chunk;
        if (!done && chunk) {
          try {
            detectedFileType = await this.fromBuffer(chunk.slice(0, sampleSize));
          } catch (error) {
            if (!(error instanceof EndOfStreamError)) {
              throw error;
            }
            detectedFileType = void 0;
          }
        }
        firstChunk = chunk;
      } finally {
        reader.releaseLock();
      }
      const transformStream = new TransformStream({
        async start(controller) {
          controller.enqueue(firstChunk);
        },
        transform(chunk, controller) {
          controller.enqueue(chunk);
        }
      });
      const newStream = stream.pipeThrough(transformStream);
      newStream.fileType = detectedFileType;
      return newStream;
    }
    check(header, options) {
      return _check(this.buffer, header, options);
    }
    checkString(header, options) {
      return this.check(stringToBytes(header), options);
    }
    async parse(tokenizer) {
      this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
      if (tokenizer.fileInfo.size === void 0) {
        tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
      }
      this.tokenizer = tokenizer;
      await tokenizer.peekBuffer(this.buffer, { length: 12, mayBeLess: true });
      if (this.check([66, 77])) {
        return {
          ext: "bmp",
          mime: "image/bmp"
        };
      }
      if (this.check([11, 119])) {
        return {
          ext: "ac3",
          mime: "audio/vnd.dolby.dd-raw"
        };
      }
      if (this.check([120, 1])) {
        return {
          ext: "dmg",
          mime: "application/x-apple-diskimage"
        };
      }
      if (this.check([77, 90])) {
        return {
          ext: "exe",
          mime: "application/x-msdownload"
        };
      }
      if (this.check([37, 33])) {
        await tokenizer.peekBuffer(this.buffer, { length: 24, mayBeLess: true });
        if (this.checkString("PS-Adobe-", { offset: 2 }) && this.checkString(" EPSF-", { offset: 14 })) {
          return {
            ext: "eps",
            mime: "application/eps"
          };
        }
        return {
          ext: "ps",
          mime: "application/postscript"
        };
      }
      if (this.check([31, 160]) || this.check([31, 157])) {
        return {
          ext: "Z",
          mime: "application/x-compress"
        };
      }
      if (this.check([199, 113])) {
        return {
          ext: "cpio",
          mime: "application/x-cpio"
        };
      }
      if (this.check([96, 234])) {
        return {
          ext: "arj",
          mime: "application/x-arj"
        };
      }
      if (this.check([239, 187, 191])) {
        this.tokenizer.ignore(3);
        return this.parse(tokenizer);
      }
      if (this.check([71, 73, 70])) {
        return {
          ext: "gif",
          mime: "image/gif"
        };
      }
      if (this.check([73, 73, 188])) {
        return {
          ext: "jxr",
          mime: "image/vnd.ms-photo"
        };
      }
      if (this.check([31, 139, 8])) {
        return {
          ext: "gz",
          mime: "application/gzip"
        };
      }
      if (this.check([66, 90, 104])) {
        return {
          ext: "bz2",
          mime: "application/x-bzip2"
        };
      }
      if (this.checkString("ID3")) {
        await tokenizer.ignore(6);
        const id3HeaderLength = await tokenizer.readToken(uint32SyncSafeToken);
        if (tokenizer.position + id3HeaderLength > tokenizer.fileInfo.size) {
          return {
            ext: "mp3",
            mime: "audio/mpeg"
          };
        }
        await tokenizer.ignore(id3HeaderLength);
        return this.fromTokenizer(tokenizer);
      }
      if (this.checkString("MP+")) {
        return {
          ext: "mpc",
          mime: "audio/x-musepack"
        };
      }
      if ((this.buffer[0] === 67 || this.buffer[0] === 70) && this.check([87, 83], { offset: 1 })) {
        return {
          ext: "swf",
          mime: "application/x-shockwave-flash"
        };
      }
      if (this.check([255, 216, 255])) {
        if (this.check([247], { offset: 3 })) {
          return {
            ext: "jls",
            mime: "image/jls"
          };
        }
        return {
          ext: "jpg",
          mime: "image/jpeg"
        };
      }
      if (this.check([79, 98, 106, 1])) {
        return {
          ext: "avro",
          mime: "application/avro"
        };
      }
      if (this.checkString("FLIF")) {
        return {
          ext: "flif",
          mime: "image/flif"
        };
      }
      if (this.checkString("8BPS")) {
        return {
          ext: "psd",
          mime: "image/vnd.adobe.photoshop"
        };
      }
      if (this.checkString("WEBP", { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (this.checkString("MPCK")) {
        return {
          ext: "mpc",
          mime: "audio/x-musepack"
        };
      }
      if (this.checkString("FORM")) {
        return {
          ext: "aif",
          mime: "audio/aiff"
        };
      }
      if (this.checkString("icns", { offset: 0 })) {
        return {
          ext: "icns",
          mime: "image/icns"
        };
      }
      if (this.check([80, 75, 3, 4])) {
        try {
          while (tokenizer.position + 30 < tokenizer.fileInfo.size) {
            await tokenizer.readBuffer(this.buffer, { length: 30 });
            const view = new DataView(this.buffer.buffer);
            const zipHeader = {
              compressedSize: view.getUint32(18, true),
              uncompressedSize: view.getUint32(22, true),
              filenameLength: view.getUint16(26, true),
              extraFieldLength: view.getUint16(28, true)
            };
            zipHeader.filename = await tokenizer.readToken(new StringType(zipHeader.filenameLength, "utf-8"));
            await tokenizer.ignore(zipHeader.extraFieldLength);
            if (zipHeader.filename === "META-INF/mozilla.rsa") {
              return {
                ext: "xpi",
                mime: "application/x-xpinstall"
              };
            }
            if (zipHeader.filename.endsWith(".rels") || zipHeader.filename.endsWith(".xml")) {
              const type = zipHeader.filename.split("/")[0];
              switch (type) {
                case "_rels":
                  break;
                case "word":
                  return {
                    ext: "docx",
                    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  };
                case "ppt":
                  return {
                    ext: "pptx",
                    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  };
                case "xl":
                  return {
                    ext: "xlsx",
                    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  };
                case "visio":
                  return {
                    ext: "vsdx",
                    mime: "application/vnd.visio"
                  };
                default:
                  break;
              }
            }
            if (zipHeader.filename.startsWith("xl/")) {
              return {
                ext: "xlsx",
                mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              };
            }
            if (zipHeader.filename.startsWith("3D/") && zipHeader.filename.endsWith(".model")) {
              return {
                ext: "3mf",
                mime: "model/3mf"
              };
            }
            if (zipHeader.filename === "mimetype" && zipHeader.compressedSize === zipHeader.uncompressedSize) {
              let mimeType = await tokenizer.readToken(new StringType(zipHeader.compressedSize, "utf-8"));
              mimeType = mimeType.trim();
              switch (mimeType) {
                case "application/epub+zip":
                  return {
                    ext: "epub",
                    mime: "application/epub+zip"
                  };
                case "application/vnd.oasis.opendocument.text":
                  return {
                    ext: "odt",
                    mime: "application/vnd.oasis.opendocument.text"
                  };
                case "application/vnd.oasis.opendocument.spreadsheet":
                  return {
                    ext: "ods",
                    mime: "application/vnd.oasis.opendocument.spreadsheet"
                  };
                case "application/vnd.oasis.opendocument.presentation":
                  return {
                    ext: "odp",
                    mime: "application/vnd.oasis.opendocument.presentation"
                  };
                default:
              }
            }
            if (zipHeader.compressedSize === 0) {
              let nextHeaderIndex = -1;
              while (nextHeaderIndex < 0 && tokenizer.position < tokenizer.fileInfo.size) {
                await tokenizer.peekBuffer(this.buffer, { mayBeLess: true });
                nextHeaderIndex = indexOf(this.buffer, new Uint8Array([80, 75, 3, 4]));
                await tokenizer.ignore(nextHeaderIndex >= 0 ? nextHeaderIndex : this.buffer.length);
              }
            } else {
              await tokenizer.ignore(zipHeader.compressedSize);
            }
          }
        } catch (error) {
          if (!(error instanceof EndOfStreamError)) {
            throw error;
          }
        }
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (this.checkString("OggS")) {
        await tokenizer.ignore(28);
        const type = new Uint8Array(8);
        await tokenizer.readBuffer(type);
        if (_check(type, [79, 112, 117, 115, 72, 101, 97, 100])) {
          return {
            ext: "opus",
            mime: "audio/opus"
          };
        }
        if (_check(type, [128, 116, 104, 101, 111, 114, 97])) {
          return {
            ext: "ogv",
            mime: "video/ogg"
          };
        }
        if (_check(type, [1, 118, 105, 100, 101, 111, 0])) {
          return {
            ext: "ogm",
            mime: "video/ogg"
          };
        }
        if (_check(type, [127, 70, 76, 65, 67])) {
          return {
            ext: "oga",
            mime: "audio/ogg"
          };
        }
        if (_check(type, [83, 112, 101, 101, 120, 32, 32])) {
          return {
            ext: "spx",
            mime: "audio/ogg"
          };
        }
        if (_check(type, [1, 118, 111, 114, 98, 105, 115])) {
          return {
            ext: "ogg",
            mime: "audio/ogg"
          };
        }
        return {
          ext: "ogx",
          mime: "application/ogg"
        };
      }
      if (this.check([80, 75]) && (this.buffer[2] === 3 || this.buffer[2] === 5 || this.buffer[2] === 7) && (this.buffer[3] === 4 || this.buffer[3] === 6 || this.buffer[3] === 8)) {
        return {
          ext: "zip",
          mime: "application/zip"
        };
      }
      if (this.checkString("ftyp", { offset: 4 }) && (this.buffer[8] & 96) !== 0) {
        const brandMajor = new StringType(4, "latin1").get(this.buffer, 8).replace("\0", " ").trim();
        switch (brandMajor) {
          case "avif":
          case "avis":
            return { ext: "avif", mime: "image/avif" };
          case "mif1":
            return { ext: "heic", mime: "image/heif" };
          case "msf1":
            return { ext: "heic", mime: "image/heif-sequence" };
          case "heic":
          case "heix":
            return { ext: "heic", mime: "image/heic" };
          case "hevc":
          case "hevx":
            return { ext: "heic", mime: "image/heic-sequence" };
          case "qt":
            return { ext: "mov", mime: "video/quicktime" };
          case "M4V":
          case "M4VH":
          case "M4VP":
            return { ext: "m4v", mime: "video/x-m4v" };
          case "M4P":
            return { ext: "m4p", mime: "video/mp4" };
          case "M4B":
            return { ext: "m4b", mime: "audio/mp4" };
          case "M4A":
            return { ext: "m4a", mime: "audio/x-m4a" };
          case "F4V":
            return { ext: "f4v", mime: "video/mp4" };
          case "F4P":
            return { ext: "f4p", mime: "video/mp4" };
          case "F4A":
            return { ext: "f4a", mime: "audio/mp4" };
          case "F4B":
            return { ext: "f4b", mime: "audio/mp4" };
          case "crx":
            return { ext: "cr3", mime: "image/x-canon-cr3" };
          default:
            if (brandMajor.startsWith("3g")) {
              if (brandMajor.startsWith("3g2")) {
                return { ext: "3g2", mime: "video/3gpp2" };
              }
              return { ext: "3gp", mime: "video/3gpp" };
            }
            return { ext: "mp4", mime: "video/mp4" };
        }
      }
      if (this.checkString("MThd")) {
        return {
          ext: "mid",
          mime: "audio/midi"
        };
      }
      if (this.checkString("wOFF") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
        return {
          ext: "woff",
          mime: "font/woff"
        };
      }
      if (this.checkString("wOF2") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
        return {
          ext: "woff2",
          mime: "font/woff2"
        };
      }
      if (this.check([212, 195, 178, 161]) || this.check([161, 178, 195, 212])) {
        return {
          ext: "pcap",
          mime: "application/vnd.tcpdump.pcap"
        };
      }
      if (this.checkString("DSD ")) {
        return {
          ext: "dsf",
          mime: "audio/x-dsf"
          // Non-standard
        };
      }
      if (this.checkString("LZIP")) {
        return {
          ext: "lz",
          mime: "application/x-lzip"
        };
      }
      if (this.checkString("fLaC")) {
        return {
          ext: "flac",
          mime: "audio/x-flac"
        };
      }
      if (this.check([66, 80, 71, 251])) {
        return {
          ext: "bpg",
          mime: "image/bpg"
        };
      }
      if (this.checkString("wvpk")) {
        return {
          ext: "wv",
          mime: "audio/wavpack"
        };
      }
      if (this.checkString("%PDF")) {
        try {
          await tokenizer.ignore(1350);
          const maxBufferSize2 = 10 * 1024 * 1024;
          const buffer = new Uint8Array(Math.min(maxBufferSize2, tokenizer.fileInfo.size));
          await tokenizer.readBuffer(buffer, { mayBeLess: true });
          if (includes(buffer, new TextEncoder().encode("AIPrivateData"))) {
            return {
              ext: "ai",
              mime: "application/postscript"
            };
          }
        } catch (error) {
          if (!(error instanceof EndOfStreamError)) {
            throw error;
          }
        }
        return {
          ext: "pdf",
          mime: "application/pdf"
        };
      }
      if (this.check([0, 97, 115, 109])) {
        return {
          ext: "wasm",
          mime: "application/wasm"
        };
      }
      if (this.check([73, 73])) {
        const fileType = await this.readTiffHeader(false);
        if (fileType) {
          return fileType;
        }
      }
      if (this.check([77, 77])) {
        const fileType = await this.readTiffHeader(true);
        if (fileType) {
          return fileType;
        }
      }
      if (this.checkString("MAC ")) {
        return {
          ext: "ape",
          mime: "audio/ape"
        };
      }
      if (this.check([26, 69, 223, 163])) {
        async function readField() {
          const msb = await tokenizer.peekNumber(UINT8);
          let mask = 128;
          let ic = 0;
          while ((msb & mask) === 0 && mask !== 0) {
            ++ic;
            mask >>= 1;
          }
          const id = new Uint8Array(ic + 1);
          await tokenizer.readBuffer(id);
          return id;
        }
        async function readElement() {
          const idField = await readField();
          const lengthField = await readField();
          lengthField[0] ^= 128 >> lengthField.length - 1;
          const nrLength = Math.min(6, lengthField.length);
          const idView = new DataView(idField.buffer);
          const lengthView = new DataView(lengthField.buffer, lengthField.length - nrLength, nrLength);
          return {
            id: getUintBE(idView),
            len: getUintBE(lengthView)
          };
        }
        async function readChildren(children) {
          while (children > 0) {
            const element = await readElement();
            if (element.id === 17026) {
              const rawValue = await tokenizer.readToken(new StringType(element.len));
              return rawValue.replaceAll(/\00.*$/g, "");
            }
            await tokenizer.ignore(element.len);
            --children;
          }
        }
        const re = await readElement();
        const docType = await readChildren(re.len);
        switch (docType) {
          case "webm":
            return {
              ext: "webm",
              mime: "video/webm"
            };
          case "matroska":
            return {
              ext: "mkv",
              mime: "video/x-matroska"
            };
          default:
            return;
        }
      }
      if (this.check([82, 73, 70, 70])) {
        if (this.check([65, 86, 73], { offset: 8 })) {
          return {
            ext: "avi",
            mime: "video/vnd.avi"
          };
        }
        if (this.check([87, 65, 86, 69], { offset: 8 })) {
          return {
            ext: "wav",
            mime: "audio/wav"
          };
        }
        if (this.check([81, 76, 67, 77], { offset: 8 })) {
          return {
            ext: "qcp",
            mime: "audio/qcelp"
          };
        }
      }
      if (this.checkString("SQLi")) {
        return {
          ext: "sqlite",
          mime: "application/x-sqlite3"
        };
      }
      if (this.check([78, 69, 83, 26])) {
        return {
          ext: "nes",
          mime: "application/x-nintendo-nes-rom"
        };
      }
      if (this.checkString("Cr24")) {
        return {
          ext: "crx",
          mime: "application/x-google-chrome-extension"
        };
      }
      if (this.checkString("MSCF") || this.checkString("ISc(")) {
        return {
          ext: "cab",
          mime: "application/vnd.ms-cab-compressed"
        };
      }
      if (this.check([237, 171, 238, 219])) {
        return {
          ext: "rpm",
          mime: "application/x-rpm"
        };
      }
      if (this.check([197, 208, 211, 198])) {
        return {
          ext: "eps",
          mime: "application/eps"
        };
      }
      if (this.check([40, 181, 47, 253])) {
        return {
          ext: "zst",
          mime: "application/zstd"
        };
      }
      if (this.check([127, 69, 76, 70])) {
        return {
          ext: "elf",
          mime: "application/x-elf"
        };
      }
      if (this.check([33, 66, 68, 78])) {
        return {
          ext: "pst",
          mime: "application/vnd.ms-outlook"
        };
      }
      if (this.checkString("PAR1")) {
        return {
          ext: "parquet",
          mime: "application/x-parquet"
        };
      }
      if (this.check([207, 250, 237, 254])) {
        return {
          ext: "macho",
          mime: "application/x-mach-binary"
        };
      }
      if (this.check([79, 84, 84, 79, 0])) {
        return {
          ext: "otf",
          mime: "font/otf"
        };
      }
      if (this.checkString("#!AMR")) {
        return {
          ext: "amr",
          mime: "audio/amr"
        };
      }
      if (this.checkString("{\\rtf")) {
        return {
          ext: "rtf",
          mime: "application/rtf"
        };
      }
      if (this.check([70, 76, 86, 1])) {
        return {
          ext: "flv",
          mime: "video/x-flv"
        };
      }
      if (this.checkString("IMPM")) {
        return {
          ext: "it",
          mime: "audio/x-it"
        };
      }
      if (this.checkString("-lh0-", { offset: 2 }) || this.checkString("-lh1-", { offset: 2 }) || this.checkString("-lh2-", { offset: 2 }) || this.checkString("-lh3-", { offset: 2 }) || this.checkString("-lh4-", { offset: 2 }) || this.checkString("-lh5-", { offset: 2 }) || this.checkString("-lh6-", { offset: 2 }) || this.checkString("-lh7-", { offset: 2 }) || this.checkString("-lzs-", { offset: 2 }) || this.checkString("-lz4-", { offset: 2 }) || this.checkString("-lz5-", { offset: 2 }) || this.checkString("-lhd-", { offset: 2 })) {
        return {
          ext: "lzh",
          mime: "application/x-lzh-compressed"
        };
      }
      if (this.check([0, 0, 1, 186])) {
        if (this.check([33], { offset: 4, mask: [241] })) {
          return {
            ext: "mpg",
            // May also be .ps, .mpeg
            mime: "video/MP1S"
          };
        }
        if (this.check([68], { offset: 4, mask: [196] })) {
          return {
            ext: "mpg",
            // May also be .mpg, .m2p, .vob or .sub
            mime: "video/MP2P"
          };
        }
      }
      if (this.checkString("ITSF")) {
        return {
          ext: "chm",
          mime: "application/vnd.ms-htmlhelp"
        };
      }
      if (this.check([202, 254, 186, 190])) {
        return {
          ext: "class",
          mime: "application/java-vm"
        };
      }
      if (this.check([253, 55, 122, 88, 90, 0])) {
        return {
          ext: "xz",
          mime: "application/x-xz"
        };
      }
      if (this.checkString("<?xml ")) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      if (this.check([55, 122, 188, 175, 39, 28])) {
        return {
          ext: "7z",
          mime: "application/x-7z-compressed"
        };
      }
      if (this.check([82, 97, 114, 33, 26, 7]) && (this.buffer[6] === 0 || this.buffer[6] === 1)) {
        return {
          ext: "rar",
          mime: "application/x-rar-compressed"
        };
      }
      if (this.checkString("solid ")) {
        return {
          ext: "stl",
          mime: "model/stl"
        };
      }
      if (this.checkString("AC")) {
        const version2 = new StringType(4, "latin1").get(this.buffer, 2);
        if (version2.match("^d*") && version2 >= 1e3 && version2 <= 1050) {
          return {
            ext: "dwg",
            mime: "image/vnd.dwg"
          };
        }
      }
      if (this.checkString("070707")) {
        return {
          ext: "cpio",
          mime: "application/x-cpio"
        };
      }
      if (this.checkString("BLENDER")) {
        return {
          ext: "blend",
          mime: "application/x-blender"
        };
      }
      if (this.checkString("!<arch>")) {
        await tokenizer.ignore(8);
        const string = await tokenizer.readToken(new StringType(13, "ascii"));
        if (string === "debian-binary") {
          return {
            ext: "deb",
            mime: "application/x-deb"
          };
        }
        return {
          ext: "ar",
          mime: "application/x-unix-archive"
        };
      }
      if (this.checkString("**ACE", { offset: 7 })) {
        await tokenizer.peekBuffer(this.buffer, { length: 14, mayBeLess: true });
        if (this.checkString("**", { offset: 12 })) {
          return {
            ext: "ace",
            mime: "application/x-ace-compressed"
          };
        }
      }
      if (this.checkString("WEBVTT") && // One of LF, CR, tab, space, or end of file must follow "WEBVTT" per the spec (see `fixture/fixture-vtt-*.vtt` for examples). Note that `\0` is technically the null character (there is no such thing as an EOF character). However, checking for `\0` gives us the same result as checking for the end of the stream.
      ["\n", "\r", "	", " ", "\0"].some((char7) => this.checkString(char7, { offset: 6 }))) {
        return {
          ext: "vtt",
          mime: "text/vtt"
        };
      }
      if (this.check([137, 80, 78, 71, 13, 10, 26, 10])) {
        await tokenizer.ignore(8);
        async function readChunkHeader() {
          return {
            length: await tokenizer.readToken(INT32_BE),
            type: await tokenizer.readToken(new StringType(4, "latin1"))
          };
        }
        do {
          const chunk = await readChunkHeader();
          if (chunk.length < 0) {
            return;
          }
          switch (chunk.type) {
            case "IDAT":
              return {
                ext: "png",
                mime: "image/png"
              };
            case "acTL":
              return {
                ext: "apng",
                mime: "image/apng"
              };
            default:
              await tokenizer.ignore(chunk.length + 4);
          }
        } while (tokenizer.position + 8 < tokenizer.fileInfo.size);
        return {
          ext: "png",
          mime: "image/png"
        };
      }
      if (this.check([65, 82, 82, 79, 87, 49, 0, 0])) {
        return {
          ext: "arrow",
          mime: "application/x-apache-arrow"
        };
      }
      if (this.check([103, 108, 84, 70, 2, 0, 0, 0])) {
        return {
          ext: "glb",
          mime: "model/gltf-binary"
        };
      }
      if (this.check([102, 114, 101, 101], { offset: 4 }) || this.check([109, 100, 97, 116], { offset: 4 }) || this.check([109, 111, 111, 118], { offset: 4 }) || this.check([119, 105, 100, 101], { offset: 4 })) {
        return {
          ext: "mov",
          mime: "video/quicktime"
        };
      }
      if (this.check([73, 73, 82, 79, 8, 0, 0, 0, 24])) {
        return {
          ext: "orf",
          mime: "image/x-olympus-orf"
        };
      }
      if (this.checkString("gimp xcf ")) {
        return {
          ext: "xcf",
          mime: "image/x-xcf"
        };
      }
      if (this.check([73, 73, 85, 0, 24, 0, 0, 0, 136, 231, 116, 216])) {
        return {
          ext: "rw2",
          mime: "image/x-panasonic-rw2"
        };
      }
      if (this.check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
        async function readHeader() {
          const guid = new Uint8Array(16);
          await tokenizer.readBuffer(guid);
          return {
            id: guid,
            size: Number(await tokenizer.readToken(UINT64_LE))
          };
        }
        await tokenizer.ignore(30);
        while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
          const header = await readHeader();
          let payload = header.size - 24;
          if (_check(header.id, [145, 7, 220, 183, 183, 169, 207, 17, 142, 230, 0, 192, 12, 32, 83, 101])) {
            const typeId = new Uint8Array(16);
            payload -= await tokenizer.readBuffer(typeId);
            if (_check(typeId, [64, 158, 105, 248, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "audio/x-ms-asf"
              };
            }
            if (_check(typeId, [192, 239, 25, 188, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "video/x-ms-asf"
              };
            }
            break;
          }
          await tokenizer.ignore(payload);
        }
        return {
          ext: "asf",
          mime: "application/vnd.ms-asf"
        };
      }
      if (this.check([171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10])) {
        return {
          ext: "ktx",
          mime: "image/ktx"
        };
      }
      if ((this.check([126, 16, 4]) || this.check([126, 24, 4])) && this.check([48, 77, 73, 69], { offset: 4 })) {
        return {
          ext: "mie",
          mime: "application/x-mie"
        };
      }
      if (this.check([39, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { offset: 2 })) {
        return {
          ext: "shp",
          mime: "application/x-esri-shape"
        };
      }
      if (this.check([255, 79, 255, 81])) {
        return {
          ext: "j2c",
          mime: "image/j2c"
        };
      }
      if (this.check([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10])) {
        await tokenizer.ignore(20);
        const type = await tokenizer.readToken(new StringType(4, "ascii"));
        switch (type) {
          case "jp2 ":
            return {
              ext: "jp2",
              mime: "image/jp2"
            };
          case "jpx ":
            return {
              ext: "jpx",
              mime: "image/jpx"
            };
          case "jpm ":
            return {
              ext: "jpm",
              mime: "image/jpm"
            };
          case "mjp2":
            return {
              ext: "mj2",
              mime: "image/mj2"
            };
          default:
            return;
        }
      }
      if (this.check([255, 10]) || this.check([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10])) {
        return {
          ext: "jxl",
          mime: "image/jxl"
        };
      }
      if (this.check([254, 255])) {
        if (this.check([0, 60, 0, 63, 0, 120, 0, 109, 0, 108], { offset: 2 })) {
          return {
            ext: "xml",
            mime: "application/xml"
          };
        }
        return void 0;
      }
      if (this.check([0, 0, 1, 186]) || this.check([0, 0, 1, 179])) {
        return {
          ext: "mpg",
          mime: "video/mpeg"
        };
      }
      if (this.check([0, 1, 0, 0, 0])) {
        return {
          ext: "ttf",
          mime: "font/ttf"
        };
      }
      if (this.check([0, 0, 1, 0])) {
        return {
          ext: "ico",
          mime: "image/x-icon"
        };
      }
      if (this.check([0, 0, 2, 0])) {
        return {
          ext: "cur",
          mime: "image/x-icon"
        };
      }
      if (this.check([208, 207, 17, 224, 161, 177, 26, 225])) {
        return {
          ext: "cfb",
          mime: "application/x-cfb"
        };
      }
      await tokenizer.peekBuffer(this.buffer, { length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true });
      if (this.check([97, 99, 115, 112], { offset: 36 })) {
        return {
          ext: "icc",
          mime: "application/vnd.iccprofile"
        };
      }
      if (this.checkString("BEGIN:")) {
        if (this.checkString("VCARD", { offset: 6 })) {
          return {
            ext: "vcf",
            mime: "text/vcard"
          };
        }
        if (this.checkString("VCALENDAR", { offset: 6 })) {
          return {
            ext: "ics",
            mime: "text/calendar"
          };
        }
      }
      if (this.checkString("FUJIFILMCCD-RAW")) {
        return {
          ext: "raf",
          mime: "image/x-fujifilm-raf"
        };
      }
      if (this.checkString("Extended Module:")) {
        return {
          ext: "xm",
          mime: "audio/x-xm"
        };
      }
      if (this.checkString("Creative Voice File")) {
        return {
          ext: "voc",
          mime: "audio/x-voc"
        };
      }
      if (this.check([4, 0, 0, 0]) && this.buffer.length >= 16) {
        const jsonSize = new DataView(this.buffer.buffer).getUint32(12, true);
        if (jsonSize > 12 && this.buffer.length >= jsonSize + 16) {
          try {
            const header = new TextDecoder().decode(this.buffer.slice(16, jsonSize + 16));
            const json = JSON.parse(header);
            if (json.files) {
              return {
                ext: "asar",
                mime: "application/x-asar"
              };
            }
          } catch {
          }
        }
      }
      if (this.check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
        return {
          ext: "mxf",
          mime: "application/mxf"
        };
      }
      if (this.checkString("SCRM", { offset: 44 })) {
        return {
          ext: "s3m",
          mime: "audio/x-s3m"
        };
      }
      if (this.check([71]) && this.check([71], { offset: 188 })) {
        return {
          ext: "mts",
          mime: "video/mp2t"
        };
      }
      if (this.check([71], { offset: 4 }) && this.check([71], { offset: 196 })) {
        return {
          ext: "mts",
          mime: "video/mp2t"
        };
      }
      if (this.check([66, 79, 79, 75, 77, 79, 66, 73], { offset: 60 })) {
        return {
          ext: "mobi",
          mime: "application/x-mobipocket-ebook"
        };
      }
      if (this.check([68, 73, 67, 77], { offset: 128 })) {
        return {
          ext: "dcm",
          mime: "application/dicom"
        };
      }
      if (this.check([76, 0, 0, 0, 1, 20, 2, 0, 0, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 70])) {
        return {
          ext: "lnk",
          mime: "application/x.ms.shortcut"
          // Invented by us
        };
      }
      if (this.check([98, 111, 111, 107, 0, 0, 0, 0, 109, 97, 114, 107, 0, 0, 0, 0])) {
        return {
          ext: "alias",
          mime: "application/x.apple.alias"
          // Invented by us
        };
      }
      if (this.checkString("Kaydara FBX Binary  \0")) {
        return {
          ext: "fbx",
          mime: "application/x.autodesk.fbx"
          // Invented by us
        };
      }
      if (this.check([76, 80], { offset: 34 }) && (this.check([0, 0, 1], { offset: 8 }) || this.check([1, 0, 2], { offset: 8 }) || this.check([2, 0, 2], { offset: 8 }))) {
        return {
          ext: "eot",
          mime: "application/vnd.ms-fontobject"
        };
      }
      if (this.check([6, 6, 237, 245, 216, 29, 70, 229, 189, 49, 239, 231, 254, 116, 183, 29])) {
        return {
          ext: "indd",
          mime: "application/x-indesign"
        };
      }
      await tokenizer.peekBuffer(this.buffer, { length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true });
      if (tarHeaderChecksumMatches(this.buffer)) {
        return {
          ext: "tar",
          mime: "application/x-tar"
        };
      }
      if (this.check([255, 254])) {
        if (this.check([60, 0, 63, 0, 120, 0, 109, 0, 108, 0], { offset: 2 })) {
          return {
            ext: "xml",
            mime: "application/xml"
          };
        }
        if (this.check([255, 14, 83, 0, 107, 0, 101, 0, 116, 0, 99, 0, 104, 0, 85, 0, 112, 0, 32, 0, 77, 0, 111, 0, 100, 0, 101, 0, 108, 0], { offset: 2 })) {
          return {
            ext: "skp",
            mime: "application/vnd.sketchup.skp"
          };
        }
        return void 0;
      }
      if (this.checkString("-----BEGIN PGP MESSAGE-----")) {
        return {
          ext: "pgp",
          mime: "application/pgp-encrypted"
        };
      }
      if (this.buffer.length >= 2 && this.check([255, 224], { offset: 0, mask: [255, 224] })) {
        if (this.check([16], { offset: 1, mask: [22] })) {
          if (this.check([8], { offset: 1, mask: [8] })) {
            return {
              ext: "aac",
              mime: "audio/aac"
            };
          }
          return {
            ext: "aac",
            mime: "audio/aac"
          };
        }
        if (this.check([2], { offset: 1, mask: [6] })) {
          return {
            ext: "mp3",
            mime: "audio/mpeg"
          };
        }
        if (this.check([4], { offset: 1, mask: [6] })) {
          return {
            ext: "mp2",
            mime: "audio/mpeg"
          };
        }
        if (this.check([6], { offset: 1, mask: [6] })) {
          return {
            ext: "mp1",
            mime: "audio/mpeg"
          };
        }
      }
    }
    async readTiffTag(bigEndian) {
      const tagId = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
      this.tokenizer.ignore(10);
      switch (tagId) {
        case 50341:
          return {
            ext: "arw",
            mime: "image/x-sony-arw"
          };
        case 50706:
          return {
            ext: "dng",
            mime: "image/x-adobe-dng"
          };
        default:
      }
    }
    async readTiffIFD(bigEndian) {
      const numberOfTags = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
      for (let n2 = 0; n2 < numberOfTags; ++n2) {
        const fileType = await this.readTiffTag(bigEndian);
        if (fileType) {
          return fileType;
        }
      }
    }
    async readTiffHeader(bigEndian) {
      const version2 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 2);
      const ifdOffset = (bigEndian ? UINT32_BE : UINT32_LE).get(this.buffer, 4);
      if (version2 === 42) {
        if (ifdOffset >= 6) {
          if (this.checkString("CR", { offset: 8 })) {
            return {
              ext: "cr2",
              mime: "image/x-canon-cr2"
            };
          }
          if (ifdOffset >= 8 && (this.check([28, 0, 254, 0], { offset: 8 }) || this.check([31, 0, 11, 0], { offset: 8 }))) {
            return {
              ext: "nef",
              mime: "image/x-nikon-nef"
            };
          }
        }
        await this.tokenizer.ignore(ifdOffset);
        const fileType = await this.readTiffIFD(bigEndian);
        return fileType ?? {
          ext: "tif",
          mime: "image/tiff"
        };
      }
      if (version2 === 43) {
        return {
          ext: "tif",
          mime: "image/tiff"
        };
      }
    }
  };
  var supportedExtensions = new Set(extensions);
  var supportedMimeTypes = new Set(mimeTypes);

  // src/index.ts
  var app = new Hono2();
  app.post("/bot", async (ctx, next) => {
    self.host = new URL(ctx.req.url).host;
    return next();
  }, webhookCallback(bot_default, "hono", {
    secretToken: self.TG_WEBHOOK_SECRET_TOKEN
  }));
  app.get("/setup", async (ctx) => {
    const webhookHost = await self.KV_IMG_MOM.get("webhookHost");
    if (!webhookHost) {
      const host = new URL(ctx.req.url).host;
      const botUrl = `https://${host}/bot`;
      await bot_default.api.setWebhook(botUrl, {
        secret_token: self.TG_WEBHOOK_SECRET_TOKEN
      });
      await bot_default.api.setMyCommands([{
        command: "/settings",
        description: "Setting up the bot"
      }]);
      await self.KV_IMG_MOM.put("webhookHost", host);
      return ctx.text(`Webhook(${botUrl}) setup successful`);
    }
    return ctx.text("401 Unauthorized. Please visit ImgMom docs (https://github.com/beilunyang/img-mom)", 401);
  });
  app.get("/img/:fileId", async (ctx) => {
    const fileId = ctx.req.param("fileId");
    const file = await bot_default.api.getFile(fileId);
    const res = await fetch(`https://api.telegram.org/file/bot${self.TG_BOT_TOKEN}/${file.file_path}`);
    if (!res.ok) {
      return ctx.text("404 Not Found. Please visit ImgMom docs (https://github.com/beilunyang/img-mom)", 404);
    }
    const bf2 = await res.arrayBuffer();
    const fileType = await fileTypeFromBuffer(bf2);
    return ctx.body(bf2, 200, {
      "Content-Type": fileType?.mime ?? ""
    });
  });
  app.get("/", (ctx) => ctx.text("Hello ImgMom (https://github.com/beilunyang/img-mom)"));
  app.fire();
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=index.js.map
