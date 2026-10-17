/**
 * A minimal TextMate grammar for Simy, so that ```simy code fences are
 * syntax-highlighted by Shiki (see `markdown.languages` in config.ts).
 *
 * It is intentionally lightweight: keywords, types, Minecraft atoms,
 * interpolations, comments and literals. Extend `patterns` / `repository`
 * as the language grows.
 */
export const simyLang = {
  name: 'simy',
  scopeName: 'source.simy',
  displayName: 'Simy',
  patterns: [
    { include: '#comments' },
    { include: '#attributes' },
    { include: '#strings' },
    { include: '#keywords' },
    { include: '#types' },
    { include: '#selectors' },
    { include: '#interpolation' },
    { include: '#numbers' },
    { include: '#operators' },
    { include: '#punctuation' },
  ],
  repository: {
    comments: {
      patterns: [
        { name: 'comment.block.documentation.simy', begin: '/\\*\\*', end: '\\*/' },
        { name: 'comment.block.simy', begin: '/\\*', end: '\\*/' },
        { name: 'comment.line.double-slash.simy', match: '//.*$' },
      ],
    },
    strings: {
      patterns: [
        {
          name: 'string.quoted.double.simy',
          begin: '"',
          end: '"',
          patterns: [
            {
              name: 'punctuation.definition.template-expression.simy',
              begin: '\\$\\{',
              end: '\\}',
            },
            { name: 'variable.other.interpolation.simy', match: '\\$[A-Za-z_][A-Za-z0-9_]*' },
          ],
        },
      ],
    },
    keywords: {
      patterns: [
        { name: 'keyword.control.simy', match: '\\b(if|elif|else|while|repeat|for|in|return)\\b' },
        {
          name: 'keyword.declaration.simy',
          match: '\\b(let|mut|const|fn|component|execute)\\b',
        },
        {
          name: 'keyword.other.execute.simy',
          match: '\\b(at|as|positioned|align|anchored|facing|rotated|store|run|unless|with)\\b',
        },
        { name: 'constant.language.boolean.simy', match: '\\b(true|false)\\b' },
      ],
    },
    attributes: {
      patterns: [{ name: 'punctuation.definition.attribute.simy', match: '#\\[[a-z_]+\\]' }],
    },
    types: {
      patterns: [
        {
          name: 'support.type.primitive.simy',
          match: '\\b(num|float|bool|str|entity|selector|pos|vec3|block|item|team|tag|nbt)\\b',
        },
        { name: 'support.type.composite.simy', match: '\\b(list|map|option)\\b' },
      ],
    },
    selectors: {
      patterns: [
        { name: 'constant.other.selector.simy', match: '@[aeprsn]\\b' },
        { name: 'keyword.operator.coordinate.simy', match: '[~^]-?\\d*(?:\\.\\d+)?' },
      ],
    },
    interpolation: {
      patterns: [{ name: 'variable.other.simy', match: '\\$[A-Za-z_][A-Za-z0-9_]*' }],
    },
    numbers: {
      patterns: [
        { name: 'constant.numeric.float.simy', match: '\\b\\d+\\.\\d+\\b' },
        { name: 'constant.numeric.integer.simy', match: '\\b\\d+\\b' },
      ],
    },
    operators: {
      patterns: [
        {
          name: 'keyword.operator.simy',
          match: '\\|>|->|\\+=|-=|\\*=|/=|%=|==|!=|<=|>=|&&|\\|\\||[-+*/%<>=!]',
        },
      ],
    },
    punctuation: {
      patterns: [
        { name: 'punctuation.separator.simy', match: '[,;:]' },
        { name: 'punctuation.section.simy', match: '[()\\[\\]{}<>]' },
      ],
    },
  },
};

export default simyLang;
