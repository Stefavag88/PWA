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
    age: 30,
    favoriteAnimal: 'cat'
  },
  {
    id: 2,
    name: 'Vag Stef',
    age: 29,
    favoriteAnimal: 'dog',
  },
  {
    id: 3,
    name: 'Antoniadis Konstantinos',
    age: 28,
    favoriteAnimal: 'cat'
  },
  {
    id: 4,
    name: 'Mr. George',
    age: 54,
    favoriteAnimal: 'dog'
  },
  {
    id: 5,
    name: 'Mary K',
    age: 20,
    favoriteAnimal: 'dolphin'
  },
];

//Example of using an index on customers.
//We have to increment the version of the DB first.
const dbPromise = idb.open('test-db', 3, upgradeDb => {

  switch (upgradeDb.oldVersion) {
    case 0:
      const keyValStore = upgradeDb.createObjectStore(keyval);
      keyValStore.put("world", "hello");
    //do not use break; here -- we want the code to continue so that every old version is checked!
    case 1:
      upgradeDb.createObjectStore(people, { keyPath: 'id' });
    case 2:
      //We have to get a hold of the object store 'people'
      const custs = upgradeDb.transaction.objectStore(people);
      //We create the index on age property and giving it the name 'age'
      custs.createIndex('age', 'age');
    //Go to bottom to see the how are getting them by index
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
});

//Add customers to 'people'store
dbPromise.then(db => {
  const tx = db.transaction(people, 'readwrite');
  const peopleStore = tx.objectStore(people);

  customers.forEach(cust => {
    peopleStore.put(cust);
  });

  return tx.complete;
}).then(() => {
  console.log('Added customers', customers);
});

//Order People by age
dbPromise.then(db => {
  const tx = db.transaction(people, 'readwrite');
  const peopleStore = tx.objectStore(people);
  const ageIndex = peopleStore.index('age');

  return ageIndex.openCursor();
}).then(function logPerson(cursor){
  if (!cursor) return;
  console.log(`Cursored at: ${cursor.value.name}`);
  return cursor.continue.then(logPerson);
}).then(() => {
  console.log('Cursoring Done');
});