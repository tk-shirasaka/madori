(function() {
    var _action = null;
    var _madori = null;

    riot.mixin('madoriEvents', {
        setMadoriEvents:    (madori) => {
            _madori = madori;
            _madori.addEventListener('mousedown', (e) => {
                _action = e.timeStamp;
            });
            _madori.addEventListener('pressup', (e) => {
                _madori  = e.target.parent;
                if (_madori.actionable() && e.timeStamp - _action < 200) riot.route(`/madori/edit/${_madori.id}`);
            });
        },
        getMadori:          () => (_madori),
    });

    riot.mixin('grid', {
        col1:   'mdl-cell mdl-cell--1-col-phone mdl-cell--2-col-tablet mdl-cell--3-col',
        col2:   'mdl-cell mdl-cell--2-col-phone mdl-cell--4-col-tablet mdl-cell--6-col',
        col3:   'mdl-cell mdl-cell--3-col-phone mdl-cell--6-col-tablet mdl-cell--9-col',
        col4:   'mdl-cell mdl-cell--4-col-phone mdl-cell--8-col-tablet mdl-cell--12-col',
    });
})();
