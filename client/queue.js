/*

Queue.js

A function to represent a queue

Created by Kate Morley - http://code.iamkate.com/ - and released under the terms
of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 */
function Queue() {

  //current queue of length (len)
  var queue = [];
  //total history of queue
  var history = [];

  // Returns the length of the queue.
  this.getLength = function () {
    return queue.length;
  }

  this.getHistory = function () {
    return history;
  }

  // Returns true if the queue is empty, and false otherwise.
  this.isEmpty = function () {
    return (queue.length == 0);
  }

  /* Enqueues the specified item. The parameter is:
   *
   * item - the item to enqueue
   */
  //return code:
  //0 - not in queue or history
  //1 - in history
  //2 - in history and in queue
  this.enqueue = function (item) {
    var code = 0;
    var queueIndex = queue.indexOf(item);
    var historyIndex = history.indexOf(item);

    //if word is in history
    if (historyIndex > -1) {
      code++;
      //if word is in queue, remove it
      if (queueIndex > -1) {
        code++
        queue.splice(queueIndex, 1);
      }

      //remove word from history
      history.splice(historyIndex, 1);
    }

    queue.push(item);
    history.push(item);

    return code;
  }

  //remove item from queue based on index
  this.remove = function (id) {

    // if the queue is empty, return immediately
    if (queue.length == 0) return;

    //get index of specified word to delete
    var index = queue.indexOf(parseInt(id, 10));

    //get difference between history length and queue length
    var diff = history.length - queue.length;

    //if word is in queue, remove it
    if (index > -1) {
      queue.splice(index, 1);
      history.splice(index + diff, 1);

      if (history.length > queue.length) {
        queue.splice(0, 0, history[diff - 1]);
      }

      return true;
    }

    return false;
  }

  /* Dequeues an item and returns it. If the queue is empty, the value
   * 'undefined' is returned.
   */
  this.dequeue = function () {

    // if the queue is empty, return immediately
    if (queue.length == 0) return undefined;

    // store the item at the front of the queue
    var item = queue[0];

    //remove first item
    queue.splice(0, 1);

    // return the dequeued item
    return item;

  }

  /* Returns the item at the front of the queue (without dequeuing it). If the
   * queue is empty then undefined is returned.
   */
  this.peek = function () {
    return (queue.length > 0 ? queue[0] : undefined);
  }

  this.getQueue = function () {
    return queue;
  }
}
