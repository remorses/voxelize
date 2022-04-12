use std::process;

use specs::DispatcherBuilder;
use voxelize::{Server, Voxelize, World, WorldConfig};

fn handle_ctrlc() {
    ctrlc::set_handler(move || {
        print!("\nStopping application...\n");
        process::exit(0);
    })
    .expect("Error setting Ctrl-C handler");
}

fn get_dispatcher() -> DispatcherBuilder<'static, 'static> {
    DispatcherBuilder::new()
}

fn main() {
    handle_ctrlc();

    let mut server = Server::new().port(4000).build();

    let config1 = WorldConfig::new().build();

    let mut world = World::new("world1", &config1);
    world.set_dispatcher(get_dispatcher);
    server.add_world(world).expect("Could not create world1.");

    let config2 = WorldConfig::new().build();
    server
        .create_world("world2", &config2)
        .expect("Could not create world2.");

    Voxelize::run(server);
}
