export function text(str) {
    console.error('setting text content, this happens before Server.onHandshake but after Client.onHandshake, str:', str);
    document.getElementById('root').textContent = str;
}