import idb from 'idb';

const stores = {
  keyval: 'keyval',
  people: 'people'
}

const { keyval, people } = stores;

const customers = [
  {
    id: 1,
    name: 'Tzolas Mitsos',
    age: 30
  },
  {
    id: 2,
    name: 'Vag Stef',
    age: 29
  },
  {
    id: 3,
    name: 'Antoniadis Konstantinos',
    age: 28
  },
  {
    id: 4,
    name: 'Mr. George',
    age: 54
  },
];


const dbPromise = idb.open('test-db', 2, upgradeDb => {

  switch (upgradeDb.oldVersion) {
    case 0:
      const keyValStore = upgradeDb.createObjectStore(keyval);
      keyValStore.put("world", "hello");
    //do not use break; here -- we want the code to continue so that every old version is checked!
    case 1:
      upgradeDb.createObjectStore(people, { keyPath:'id' });
  }
});

// read "hello" in "keyval"
dbPromise.then(db => {
  const tx = db.transaction(keyval);
  const keyValStore = tx.objectStore(keyval);
  return keyValStore.get('hello');
}).then(function (val) {
  console.log('The value of "hello" is:', val);
});

// set "foo" to be "bar" in "keyval"
dbPromise.then(db => {
  const tx = db.transaction(keyval, 'readwrite');
  const keyValStore = tx.objectStore(keyval);
  keyValStore.put('bar', 'foo');
  return tx.complete;
}).then(function () {
  console.log('Added foo:bar to keyval');
});

//set favouriteAnimal to cat
dbPromise.then(db => {
  const tx = db.transaction(keyval, 'readwrite');
  const keyValStore = tx.objectStore(keyval);
  keyValStore.put('cat', 'favoriteAnimal');
  return tx.complete;
}).then(() => {
  console.log('Added favoriteAnimal : cat');
})

dbPromise.then(db => {

  const tx = db.transaction(people, 'readwrite');
  const peopleStore = tx.objectStore(people);

  customers.forEach( cust => {
    peopleStore.put(cust);
  });
 
  return tx.complete;
}).then(() => {
  console.log('Added customers', customers);
})