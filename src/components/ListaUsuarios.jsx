import Usuario from "./Usuario";

export default function ListaUsuarios({ usuarios }) {
    return (
        <div>
            {usuarios?.length > 0
                ? <table>
                    <thead>
                        <tr><th>Nome</th><th>E-mail</th><th>Alterar</th></tr>
                    </thead>
                    <tbody>
                        {usuarios.map(usuario => <Usuario key={usuario._id} usuario={usuario} />)}
                    </tbody>
                </table>
                : <p>Nenhum usuário cadastrado</p>
            }
        </div>
    )
}