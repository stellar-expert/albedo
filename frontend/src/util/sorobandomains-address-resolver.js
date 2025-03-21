export function resolveSorobandomainsAccount(name, callback) {
    fetch(`https://sorobandomains-query.lightsail.network/api/v1/query?q=${encodeURIComponent(name.toLowerCase())}&type=domain`)
        .then(res => res.json())
        .then(resolved => callback(resolved?.address || null))
        .catch(e => callback(null))//ignore resolution errors
}