const escaped = 'C++'.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(`(?<!\\w)(${escaped})(?!\\w)`, 'gi');
console.log(regex.test('I know C++ and Java'));
console.log('I know C++ and Java'.replace(regex, '[$1]'));
