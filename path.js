//@author = Knieperd - Version 1.0

/** @param {NS} ns **/
export async function main(ns) {
	var target = ns.args[0]
	var path = []

	var list = ns.scan("home")
	var templist = []

	var j = 0

	while (j == 0  && list.length > 0) {
		await ns.asleep(5)
		var current = list[0]
		list.shift()
		if (current == target) {
			path.push(current)
			while (current != "home") {
				current = path[0]
				templist = ns.scan(current)
				path.unshift(templist[0])
			}
			j++
			path.shift()
			ns.tprint("The path is: " + path)
		} else {
			templist = ns.scan(current)
			templist.shift()
			list = list.concat(templist)
		}
	}
	if (path.length == 0) {
		ns.tprint("Couldn't find the path, are you sure you typed the host correctly?")
	}
	

}