import { strict as assert } from 'assert';
import fs from "fs";
import * as matter from "gray-matter";
import path from "path";
import * as Realm from "realm-web";
import { load } from "ts-dotenv";
import Entity from "./domain/Entity";
import Fragment from "./domain/Fragment";
import extractDate from "./extractDate";
import { extractEntities } from "./extractEntities";
import { extractFragments } from "./extractFragments";

const env = load({
  REALM_APP_ID: String,
  REALM_APP_USER_ID: String,
  REALM_APP_USER_PASSWORD: String,
  MONGO_DB_NAME: String,
  DENDRON_VAULT_PATH: String,
});

// joining path of directory
const directoryPath = path.join(__dirname, env.DENDRON_VAULT_PATH);

const credentials = Realm.Credentials.emailPassword(
  env.REALM_APP_USER_ID,
  env.REALM_APP_USER_PASSWORD
);

async function getConnection() {
  let user: Realm.User | null = null;
  try {
    const app: Realm.App = new Realm.App(env.REALM_APP_ID);
    // Authenticate the user
    user = await app.logIn(credentials);
    return user.mongoClient("mongodb-atlas");
  } catch (err) {
    console.error("Failed to log in", err);
  }

  return null;
}

export async function deleteAllCollections(): Promise<string> {
  let mongodb = await getConnection();

  if (mongodb === null) {
    return "FAIL";
  }

  let atlasNotesColl = mongodb.db(env.MONGO_DB_NAME).collection("notes");
  const deleteNotesResult = await atlasNotesColl.deleteMany({});

  // const atlasFragmentsColl = mongodb
  //   .db(env.MONGO_DB_NAME)
  //   .collection("fragments");
  // const deleteFragmentsResult = await atlasFragmentsColl.deleteMany({});

  // const atlasEntitiesColl = mongodb
  //   .db(env.MONGO_DB_NAME)
  //   .collection("entities");
  // const deleteEntitiesResult = await atlasEntitiesColl.deleteMany({});

  return "SUCCESS";
}

export async function sync2mongo(): Promise<string> {
  let mongodb = await getConnection();

  if (mongodb === null) {
    return "FAIL";
  }

  const files = fs.readdirSync(directoryPath);
  const mdNotes: any[] = [];
  const mdNotesMap: { [key: string]: any } = {};
  files.forEach(function (file: any) {
    const filePath = `${directoryPath}/${file}`;
    // Do whatever you want to do with the file
    const isDirectory = fs.lstatSync(filePath).isDirectory();
    if (!isDirectory) {
      const md = matter.read(filePath);
      if (md.data.id && md.data.id !== "root") {
        md.data.filename = file;
        mdNotes.push(md);
        mdNotesMap[md.data.id] = md;
      }
    }
  });

  // const result = await notes.insertMany(markdowns)

  // commencer par récupérer la liste des documents stockés sur Mongodb
  let atlasNotesColl = mongodb.db(env.MONGO_DB_NAME).collection("notes");
  const atlasNotes: any[] = await atlasNotesColl.find({});

  // identifier les éléments qui sont sur la db mongo et pas en local, et les effacer sur mongodb
  let mongoNoteIds = atlasNotes.map((note) => note.data.id);

  atlasNotes.forEach((note: any) => {
    mdNotes.forEach((md) => {
      if (
        note.data.id === md.data.id &&
        note.data.updated === md.data.updated
      ) {
        mongoNoteIds = mongoNoteIds.filter((noteId) => noteId !== md.data.id);
      }
    });
  });

  if (mongoNoteIds.length > 0) {
    const deleteQuery = { "data.id": { $in: mongoNoteIds } };
    const deleteResult = await atlasNotesColl.deleteMany(deleteQuery);
  } else {
    console.info("there were no documents to purge");
  }

  // identifier les éléments qui sont présents en local et pas sur mongodb et les créer sur mongodb

  let mdNoteIds = mdNotes.map((note) => note.data.id);

  mdNotes.forEach((md: any) => {
    atlasNotes.forEach((note) => {
      if (note.data.id === md.data.id) {
        mdNoteIds = mdNoteIds.filter((noteId) => noteId !== md.data.id);
      }
    });
  });

  if (mdNoteIds.length > 0) {
    // uniquement pour les notes de type journal, identifier les fragments et les entités et les stocker sur mongo

    // const fragments: Fragment[] = [];

    // mdNoteIds
    //   .map((id) => mdNotesMap[id])
    //   .forEach((mdNote) => {
    //     // extraire la date
    //     const date = extractDate(mdNote.data.filename);
    //     if (date) {
    //       // extraire les fragments
    //       const noteFragments = extractFragments(
    //         mdNote.content,
    //         mdNote.data.id,
    //         date.toDate()
    //       );
    //       fragments.push(...noteFragments);
    //     }
    //   });

    await atlasNotesColl.insertMany(mdNoteIds.map((id) => mdNotesMap[id]));

    // const atlasFragmentsColl = mongodb
    //   .db(env.MONGO_DB_NAME)
    //   .collection("fragments");
    // await atlasFragmentsColl.insertMany(fragments);

  } else {
    console.log("there were no new documents");
  }

  return "SUCCESS";
}

async function resetCollections() {}
