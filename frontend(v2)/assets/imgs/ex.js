const files = require.context('@/static/imgs/ex', true, /\.png$/)
const items = files.keys().reduce((items, modulePath) => {
    // sel './dota2.png' => 'dota2'
    const iconName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
    const value = files(modulePath);
    items[iconName] = value;
    return items;
}, {})
export default { items }
