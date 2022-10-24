module.exports = {
	"sidebar": [
		{
			"type": "category",
			"label": "Getting Started",
			"items": [
				"getting_started/introduction",
				"getting_started/installation",
				"getting_started/import",
				"getting_started/configure",
			]
		},
		{
			"type": "category",
			"label": "Guide",
			"items": [
				{ 
					"Entity": [
						{
							"type": "doc",
							"id": 'guide/entity/methods'
						},
						{
							"type": "doc",
							"id": 'guide/entity/decorators'
						},
						{
							"type": "doc",
							"id": 'guide/entity/modeling'
						}
					] 
				},
				"guide/condition",
				"guide/query",
				"guide/scan",
				"guide/transactions",
				"guide/dynamode",
			]
		},
		{
			"type": "doc",
			"id": 'other/version_requirements'
		}
	]
};