exports.populatePageUrls = (pages) => {
	for (var i = pages.length - 1; i >= 0; i--) {
		let pageType = pages[i].isParent ? 'sections' : 'pages';
		pages[i].links = {
			self: `/${pageType}/${pages[i].id}`
		}
	}
	return pages;
}

exports.filterVisible = (pages) => {
	let filteredPages = pages.filter((page) => {
		return page.visible == true;
	});
	return filteredPages;
}

exports.order = (pages) => {
	pages.sort((a, b) => {
		return a.position - b.position;
	});

	return pages;
}