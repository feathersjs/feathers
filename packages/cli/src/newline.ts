import { EOL } from 'os'
const newline = (str: string) => {
	const newlines = str.match(/(?:\r?\n)/g) || [];

	if (newlines.length === 0) {
		return EOL
	}

	const crlf = newlines.filter(newline => newline === '\r\n').length;
	const lf = newlines.length - crlf;

	return crlf > lf ? '\r\n' : '\n';
};


export default newline