﻿import Control from '../../../ui/Control';
import XType from '../../../ui/XType';

import SetGeometryValueCommand from '../../../command/SetGeometryValueCommand';
import GeometryInfoPanel from './GeometryInfoPanel';
import BufferGeometryPanel from './BufferGeometryPanel';
import GeometryModifyPanel from './GeometryModifyPanel';

import BoxGeometryPanel from './BoxGeometryPanel';
import CircleGeometryPanel from './CircleGeometryPanel';
import CylinderGeometryPanel from './CylinderGeometryPanel';
import IcosahedronGeometryPanel from './IcosahedronGeometryPanel';
import LatheGeometryPanel from './LatheGeometryPanel';
import PlaneGeometryPanel from './PlaneGeometryPanel';
import SphereGeometryPanel from './SphereGeometryPanel';
import TorusGeometryPanel from './TorusGeometryPanel';
import TorusKnotGeometryPanel from './TorusKnotGeometryPanel';

/**
 * 几何体面板
 * @author mrdoob / http://mrdoob.com/
 */
const GeometryPanels = {
    'BoxGeometry': BoxGeometryPanel,
    'BoxBufferGeometry': BoxGeometryPanel,
    'CircleGeometry': CircleGeometryPanel,
    'CircleBufferGeometry': CircleGeometryPanel,
    'CylinderGeometry': CylinderGeometryPanel,
    'CylinderBufferGeometry': CylinderGeometryPanel,
    'IcosahedronGeometry': IcosahedronGeometryPanel,
    'IcosahedronBufferGeometry': IcosahedronGeometryPanel,
    'LatheGeometry': LatheGeometryPanel,
    'LatheBufferGeometry': LatheGeometryPanel,
    'PlaneGeometry': PlaneGeometryPanel,
    'PlaneBufferGeometry': PlaneGeometryPanel,
    'SphereGeometry': SphereGeometryPanel,
    'SphereBufferGeometry': SphereGeometryPanel,
    'TorusGeometry': TorusGeometryPanel,
    'TorusBufferGeometry': TorusGeometryPanel,
    'TorusKnotGeometry': TorusKnotGeometryPanel,
    'TorusKnotBufferGeometry': TorusKnotGeometryPanel
};

function GeometryPanel(options) {
    Control.call(this, options);
    this.app = options.app;
};

GeometryPanel.prototype = Object.create(Control.prototype);
GeometryPanel.prototype.constructor = GeometryPanel;

GeometryPanel.prototype.render = function () {
    var editor = this.app.editor;

    var data = {
        xtype: 'div',
        id: 'geometryPanel',
        parent: this.parent,
        cls: 'Panel',
        style: 'border-top: 0; padding-top: 20px;',
        children: [{ // type
            xtype: 'row',
            id: 'geometryTypeRow',
            children: [{
                xtype: 'label',
                text: '类型'
            }, {
                xtype: 'text',
                id: 'geometryType'
            }]
        }, { // uuid
            xtype: 'row',
            id: 'geometryUUIDRow',
            children: [{
                xtype: 'label',
                text: 'UUID'
            }, {
                xtype: 'input',
                id: 'geometryUUID',
                style: 'width: 102px; font-size: 12px;',
                disabled: true
            }, {
                xtype: 'button',
                id: 'geometryUUIDRenew',
                text: '新建',
                style: 'margin-left: 7px;',
                onClick: function () {
                    geometryUUID.setValue(THREE.Math.generateUUID());
                    editor.execute(new SetGeometryValueCommand(editor.selected, 'uuid', geometryUUID.getValue()));
                }
            }]
        }, { // name
            xtype: 'row',
            id: 'geometryNameRow',
            children: [{
                xtype: 'label',
                text: '名称'
            }, {
                xtype: 'input',
                id: 'geometryName',
                style: 'width: 150px; font-size: 12px;',
                onChange: function () {
                    editor.execute(new SetGeometryValueCommand(editor.selected, 'name', this.getValue()));
                }
            }]
        }, {
            xtype: 'span',
            id: 'geometryParameters'
        }]
    };

    var container = XType.create(data);
    container.render();

    var geometryType = XType.getControl('geometryType');
    var geometryUUID = XType.getControl('geometryUUID');
    var geometryName = XType.getControl('geometryName');
    var parameters = XType.getControl('geometryParameters');

    function build() {
        var object = editor.selected;

        if (object && object.geometry) {
            var geometry = object.geometry;

            container.dom.style.display = 'block';

            geometryType.setValue(geometry.type);
            geometryUUID.setValue(geometry.uuid);
            geometryName.setValue(geometry.name);

            //

            parameters.dom.innerHTML = '';

            if (geometry.type === 'BufferGeometry' || geometry.type === 'Geometry') {
                parameters.dom.appendChild(new GeometryModifyPanel(editor, object).dom);
            }

            if (GeometryPanels[geometry.type] !== undefined) {
                parameters.dom.appendChild(new GeometryPanels[geometry.type](editor, object).dom);
            } else {

            }
        } else {
            container.dom.style.display = 'none';
        }

    }

    // geometry
    container.dom.appendChild(new GeometryInfoPanel(editor).dom);

    // buffergeometry
    container.dom.appendChild(new BufferGeometryPanel(editor).dom);
    container.dom.appendChild(parameters.dom);

    this.app.on('objectSelected.GeometryPanel', function () {
        build();
    });

    this.app.on('geometryChanged.GeometryPanel', function () {
        build();
    });
};

export default GeometryPanel;