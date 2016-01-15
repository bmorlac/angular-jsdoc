exports.defineTags = function(dictionary) {
  function hasUrlPrefix(text) {
    return (/^(http|ftp)s?:\/\//).test(text);
  }

  dictionary.defineTag('ngdoc', {
    mustHaveValue: true,
    onTagged : function(doclet, tag) {
      if (tag.value == "method") {
        doclet.addTag('kind', 'function');
      } else {
        doclet.addTag('kind', 'class');
      }
      doclet.ngdoc = tag.value;
    }
  });

  dictionary.defineTag('attribute', {
    mustHaveValue: true,
    canHaveType: true,
    canHaveName: true,
    onTagged: function(doclet, tag) {
      if (!doclet.attributes) { doclet.attributes = []; }
      doclet.attributes.push(tag.value);
    }
  })
  .synonym('attr');

  dictionary.defineTag('restrict', {
    mustHaveValue: true,
    onTagged: function(doclet, tag) {
      var restricts={
          'A': 'Attribute',
          'E': 'Element',
          'C': 'Class'
      }
      var s = tag.value.split('').map(function(aec) {
        return restricts[aec];
      })
      doclet.restrict = s;
    }
  });

  dictionary.defineTag('priority', {
    mustHaveValue: true,
    onTagged: function(doclet, tag) {
      doclet.priority = tag.value;
    }
  });

  dictionary.defineTag('eventType', {
    mustHaveValue: true,
    onTagged: function(doclet, tag) {
      doclet.eventType = tag.value;
    }
  });

  dictionary.defineTag('animations', {
    mustHaveValue: true,
    onTagged: function(doclet, tag) {
      doclet.animations = tag.value;
    }
  });

  dictionary.defineTag('scope', {
    onTagged: function(doclet, tag) {
      var scopeType={
        'object': '\'isolate\' scope',
        '{}': '\'isolate\' scope',
        'true': 'scope which prototypically inherits from its parent',
        'false': 'shared scope'
      }
      var s = function() {
        return scopeType[tag.value];
      }();
      if (!tag.value || !s) {
        doclet.scopeType = 'scope';
      } else {
        doclet.scopeType = s;
      }
      doclet.newScope = !(s == 'shared scope');
    }
  });

  dictionary.defineTag('description', {
    mustHaveValue: true,
    onTagged: function(doclet, tag) {
      var helper = require('jsdoc/util/templateHelper');

      // replace inline link tags
      tag.value = require('jsdoc/tag/inline').replaceInlineTag(tag.value, 'link', function(string, matchedTag) {
        var match;
        var longname;
        var text;
        var fragmentId;
        var link;

        if ( hasUrlPrefix(matchedTag.text) ) {
          match = /(\S+)\s(\S+)/.exec(matchedTag.text);
          if (match) {
            longname = match[1];
            text = match[2] || match[1];
          }
        }
        else {
          match = /(\S+)#(methods|properties|events)_(\S+)\s(\S+)/.exec(matchedTag.text);
          if (match) {
            longname = match[1];
            text = match[4] || match[3];
            fragmentId = match[3];
            helper.registerLink(longname, longname + '.html');
          }
        }

        link = helper.linkto(longname, helper.htmlsafe(text), null, fragmentId);
        return tag.value.replace(new RegExp(require('escape-string-regexp')(matchedTag.completeTag), 'g'), link);
      }).newString;
    },
    synonyms: ['desc']
  });
};
