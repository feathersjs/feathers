import feathers from './';

const app = feathers();

type model = {id?: number, user?:string, pass?:string};

const service = app.service<model>('user'); 

(async () => {
  let m1 = await service.get(1);
  let m2 = await service.patch(m1.id, {user:''});

  console.log(m2.pass);
})();
