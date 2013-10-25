$(function(){
	$("#grid").mason({
		itemSelector: ".box",
		ratio: 1.5,
		sizes: [
			[1,1]
			

		],
		columns: [
			[0,480,1],
			[480,780,2],
			[780,1080,3],
			[1080,1320,4],
			[1320,1680,5]
		],
		filler: {
			itemSelector: '.fillerBox',
			filler_class: 'custom_filler'
		},
		layout: 'fluid',
	});
});