export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback()
          // quando alguém tenta rodar publish, ainda vai tentar trackear de fato que as coisas foram
          // invocadas, o numero de vezes que foi invocado, quais argumentos foram fornecidos,
          // também sera possivel executar a funcao, peagr o callback e invocar para certificar que
          // o base publisher esta feliz
        }
      ),
  },
}
