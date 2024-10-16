/* A simple togglebutton kinda link */

L.Control.ToggleButton = L.Control.extend({
	options:{
		position: 'topleft',
		offText: '>',
		onText: '<',
		offTitle: 'Toggle me on',
		onText: 'Toggle me off',
		state: 'off',
		title: 'I\'m a ToggleButton',
		toggleFunction: false
		},
	onAdd: function (map) {
		var container = this._container = L.DomUtil.create(
			'div', 'leaflet-control-button leaflet-bar leaflet-control' );
		L.DomEvent
			.disableClickPropagation(container)
			.disableScrollPropagation(container);
		
		var link = this._link = L.DomUtil.create('a', '', container);
		link.href = '#';
		link.title = this.options[this.options.state + 'Title'];
		link.innerHTML = this.options[this.options.state+'Text'];
		L.DomEvent
			.on(link, 'click', this.toggle, this);
		if (this.options.state != 'off') {
			this.toggle();
		}
		return container;
	},
	onRemove: function (map) {

	},
	toggle: function() {
		if (this.options.toggleFunction) {
			this.options.toggleFunction();
		}
		if (this.options.state == 'off') {
			this._toggleOn();
		} else {
			this._toggleOff();
		}
	},
	_toggleOn: function () {
		L.DomUtil.addClass(
			this._link, 'leaflet-control-button-toggleon');
		this.options.state = 'on';
		this._link.innerHTML = this.options.onText;
		this._link.title = this.options.onTitle;
	},
	_toggleOff: function () {
		this._link.className = this._link.className.replace(
			'leaflet-control-button-toggleon', '');
		this.options.state = 'off';
		this._link.innerHTML = this.options.offText;
		this._link.title = this.options.offTitle;
	}
});

L.control.toggleButton = function (options) {
	return new L.Control.ToggleButton(options);
}