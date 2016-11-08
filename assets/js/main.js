(function() {
    var action  = null;
    var madori  = null;

    riot.mixin('madoriEvents', {
        setMadoriEvents:    (madori) => {
            madori.addEventListener('mousedown', (e) => {
                action  = e.timeStamp;
            });
            madori.addEventListener('pressup', (e) => {
                madori  = e.target.parent;
                if (madori.actionable() && e.timeStamp - action < 50) riot.route(`/madori/edit/${madori.id}`);
            });
        },
    });

    riot.mixin('grid', {
        col1:   'mdl-cell mdl-cell--1-col-phone mdl-cell--2-col-tablet mdl-cell--3-col',
        col2:   'mdl-cell mdl-cell--2-col-phone mdl-cell--4-col-tablet mdl-cell--6-col',
        col3:   'mdl-cell mdl-cell--3-col-phone mdl-cell--6-col-tablet mdl-cell--9-col',
        col4:   'mdl-cell mdl-cell--4-col-phone mdl-cell--8-col-tablet mdl-cell--12-col',
    });
})();
