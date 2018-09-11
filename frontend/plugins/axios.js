export default function({ $axios, redirect }) {
  $axios.onError(error => {
    console.log(error.code);
    const code = parseInt(
      (error.response && error.response.status) || error.code
    );
    console.log(`Axios: Request Error with Code ${code}`);
    if (code === 401) {
      redirect("/logout");
    }
  });
}
